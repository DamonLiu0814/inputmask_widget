odoo.define('web.inputmask_widgets', function (require) {
    "use strict";
    var core = require('web.core');
    var translation = require('web.translation');
    var _t = translation._t;
    var form_widgets = require('web.form_widgets');
    var kanban_widgets = require('web_kanban.widgets');
    var WebClient = require('web.WebClient');
    var list_widget_registry = core.list_widget_registry;
    var QWeb = core.qweb;

    var age = 0;

    const WIDGET_ = 'data-inputmask-alias';
    const DATA_INPUTMASK_MASK = 'data-inputmask-mask';
    const DATA_INPUTMASK_MIN = 'data-inputmask-min';
    const DATA_INPUTMASK_MAX = 'data-inputmask-max';
    const DATA_INPUTMASK_DIASTOLIC_MIN = 'data-inputmask-diastolic-min';
    const DATA_INPUTMASK_DIASTOLIC_MAX = 'data-inputmask-diastolic-max';
    const DATA_INPUTMASK_SYSTOLIC_MIN = 'data-inputmask-systolic-min';
    const DATA_INPUTMASK_SYSTOLIC_MAX = 'data-inputmask-systolic-max';
    const DATA_INPUTMASK_MEASURE = 'data-inputmask-measure';
    const DATA_INPUTMASK_AUTOUNMASK = 'data-inputmask-autounmask';
    const DATA_INPUTMASK_AUTOGROUP = 'data-inputmask-autogroup';
    const DATA_INPUTMASK_SEPARATOR = 'data-inputmask-separator';
    
    const BLOODPRESSURE_WIDGET = 'bloodpressure';
    const BLOODPRESSURE_WIDGET_ALIAS = 'widget-alias';
    const DATA_INPUTMASK_WIDGET_ALIAS = 'widget-alias';
    const DATA_TIPSO = 'data-tipso';

    const INVALID_VALUE_CLASS = 'invalid-value';

    const SUFFIX = 'suffix';
    const INLINE_CLASS = 'inline';
    const MIN = 'min';
    const MAX = 'max';
    const SYSTOLIC_MIN = 'systolic-min';
    const SYSTOLIC_MAX = 'systolic-max';
    const DIASTOLIC_MIN = 'diastolic-min';
    const DIASTOLIC_MAX = 'diastolic-max';
    
    function mask_attrs(attrs) {
        var keyMask = 'data-inputmask';
        var attrsMask;
        attrsMask = Object.keys(attrs).reduce(function (filtered, key) {
            if (key.indexOf(keyMask) !== -1)
                filtered[key] = attrs[key];
            return filtered;
        }, {});
        if (!attrsMask)
            console.warn("The widget Mask expects the 'data-inputmask[-attribute]' attrsMask!");
        return attrsMask;
    }

    var AbstractFieldMask = {
        template: "FieldMask",
        attrsMask: {},
        maskType: undefined,
        init: function (field_manager, node) {
            this._super(field_manager, node);
            this.attrsMask =  _.extend({}, this.attrsMask, mask_attrs(node.attrs));
            // this.field_manager.on("load_record", this, function() { this.render_value(); });
        },
        render_value: function () {
            this._super();
            var suffix_visible = true;
            if (this.$input !== undefined) {
                this.$input.inputmask(this.maskType,
                    { "onincomplete": function(e) {
                            console.log('inputmask incomplete');
                            if( ! e.currentTarget.inputmask.isValid()) {
                                $(this).addClass(INVALID_VALUE_CLASS);
                                this.value = "";
                            }
                        },
                      "oncomplete": function(e) {
                            $(this).tipso('hide');
                            $(this).removeClass(INVALID_VALUE_CLASS);
                            if ($(this).attr(BLOODPRESSURE_WIDGET_ALIAS) == BLOODPRESSURE_WIDGET) {
                                var value = e.currentTarget.value.replace(/_/g, "").split("/");
                                if ( ! (parseInt(value[0]) >= $(this).attr(DATA_INPUTMASK_SYSTOLIC_MIN) 
                                    && parseInt(value[0]) <= $(this).attr(DATA_INPUTMASK_SYSTOLIC_MAX)) ||
                                     ! (parseInt(value[1]) >= $(this).attr(DATA_INPUTMASK_DIASTOLIC_MIN) 
                                    && parseInt(value[1]) <= $(this).attr(DATA_INPUTMASK_DIASTOLIC_MAX))) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    this.value = ""
                                    $(this).addClass(INVALID_VALUE_CLASS);
                                    $(this).tipso('show');
                                } else {
                                    $(this).removeClass(INVALID_VALUE_CLASS);
                                    $(this).tipso('hide');
                                }
                            } else {
                                var value = e.currentTarget.value.replace(/_/g, "");
                                if ( ! (Number(value) >= Number($(this).attr(DATA_INPUTMASK_MIN))
                                     && Number(value) <= Number($(this).attr(DATA_INPUTMASK_MAX))) ) {
                                    this.value = ""
                                    $(this).addClass(INVALID_VALUE_CLASS);
                                    $(this).tipso('show');
                                } else {
                                    $(this).removeClass(INVALID_VALUE_CLASS);
                                    $(this).tipso('hide');
                                }
                            }
                        },
                });
                if(this.$input.hasClass('o_form_invisible')) { suffix_visible = false; }
                this.addAttr();
                this.addTipsoEventListeners(this.$input);
            } else {
                this.$el.val(this.$el.text());
                if(this.$el.hasClass('o_form_invisible')) { suffix_visible = false; }
            }
            suffix_visible = true
            this.add_sufix(suffix_visible);
            this.addTipso();            
        },
        addTipso: function() {
            if(DATA_TIPSO in this.node.attrs) {
                if (this.$input !== undefined) {
                    this.$input.attr(DATA_TIPSO, this.node.attrs[DATA_TIPSO]);
                    var title = this.node.attrs['name'].toUpperCase();

                    var message = this.node.attrs[DATA_TIPSO] + ' ' + 
                            ' desde ' + this.node.attrs[DATA_INPUTMASK_MIN] +
                            ' hasta ' + this.node.attrs[DATA_INPUTMASK_MAX] +
                            ' ' + this.node.attrs[DATA_INPUTMASK_MEASURE];
                    
                    if (this.node.attrs[BLOODPRESSURE_WIDGET_ALIAS] == BLOODPRESSURE_WIDGET) {
                        message = 'Sistólica ('+ 
                            this.attrsMask[DATA_INPUTMASK_SYSTOLIC_MIN] +' a '+ 
                            this.attrsMask[DATA_INPUTMASK_SYSTOLIC_MAX]+') <br> Diastólica ('+
                            this.attrsMask[DATA_INPUTMASK_DIASTOLIC_MIN]+' a '+ 
                            this.attrsMask[DATA_INPUTMASK_DIASTOLIC_MAX]+ ')'
                    }
                    this.$input.tipso({titleContent: title, content: message});
                }
            }
        },
        addAttr: function() {
            if(this.node.attrs[BLOODPRESSURE_WIDGET_ALIAS] == BLOODPRESSURE_WIDGET) {
                if(DIASTOLIC_MIN in this.node.attrs && DIASTOLIC_MAX in this.node.attrs) {
                    this.$input.attr(DATA_INPUTMASK_DIASTOLIC_MIN, this.node.attrs[DIASTOLIC_MIN]);
                    this.$input.attr(DATA_INPUTMASK_DIASTOLIC_MAX, this.node.attrs[DIASTOLIC_MAX]);
                    this.attrsMask[DATA_INPUTMASK_DIASTOLIC_MIN] = this.node.attrs[DIASTOLIC_MIN],
                    this.attrsMask[DATA_INPUTMASK_DIASTOLIC_MAX] = this.node.attrs[DIASTOLIC_MAX]
                }
                if(SYSTOLIC_MIN in this.node.attrs && SYSTOLIC_MAX in this.node.attrs) {
                    this.$input.attr(DATA_INPUTMASK_SYSTOLIC_MIN, this.node.attrs[SYSTOLIC_MIN]);
                    this.$input.attr(DATA_INPUTMASK_SYSTOLIC_MAX, this.node.attrs[SYSTOLIC_MAX]);
                    this.attrsMask[DATA_INPUTMASK_SYSTOLIC_MIN] = this.node.attrs[SYSTOLIC_MIN],
                    this.attrsMask[DATA_INPUTMASK_SYSTOLIC_MAX] = this.node.attrs[SYSTOLIC_MAX]
                }
            } else {
                if(DATA_INPUTMASK_MIN in this.node.attrs && DATA_INPUTMASK_MAX in this.node.attrs) {
                    this.$input.attr(DATA_INPUTMASK_MIN, this.node.attrs[DATA_INPUTMASK_MIN]);
                    this.attrsMask[DATA_INPUTMASK_MIN] = this.node.attrs[DATA_INPUTMASK_MIN];
                    this.$input.attr(DATA_INPUTMASK_MAX, this.node.attrs[DATA_INPUTMASK_MAX]);
                    this.attrsMask[DATA_INPUTMASK_MAX] = this.node.attrs[DATA_INPUTMASK_MAX];
                }
            }
            if(DATA_INPUTMASK_MEASURE in this.node.attrs) {
                this.$input.attr(DATA_INPUTMASK_MEASURE, this.node.attrs[DATA_INPUTMASK_MEASURE]);
                this.attrsMask[DATA_INPUTMASK_MEASURE] = this.node.attrs[DATA_INPUTMASK_MEASURE];
            }
            if(DATA_INPUTMASK_WIDGET_ALIAS in this.node.attrs) {
                this.$input.attr(DATA_INPUTMASK_WIDGET_ALIAS, this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS]);
            }
        },
        addTipsoEventListeners(input) {
            input.focusout(function(e) { $(this).tipso('hide'); });
            input.focus(function(e) { $(this).tipso('show'); });
            input.keypress(function(e) { $(this).tipso('show'); });
            input.mouseover(function(e) { $(this).tipso('show'); });
        },
        add_sufix: function (is_visible) {
            if (SUFFIX in this.node.attrs) {
                if (this.node.attrs[SUFFIX] == "true" || this.node.attrs[SUFFIX] == "1") {
                    var visible = is_visible == false ? 'o_form_invisible' : ''; 
                    var suffix = $("<span class='mask-suffix " + visible + " input-group-text'></span>").text(this.node.attrs[DATA_INPUTMASK_MEASURE]);
                    var container_div = $('<div class="input-group mb-3"></div>');
                    var prefix_div = $('<div class="input-group-prepend"></div>');
                    var sufix_div = $('<div class="input-group-append"></div>');
                    
                    var domElement = $( this ).get( 0 );
                    var span = domElement.$el.parent()
                    if(span.is('td')) {
                        sufix_div.append(suffix);
                        container_div.append(prefix_div);
                        this.$el.addClass(INLINE_CLASS);
                        this.$el.detach().appendTo(container_div);
                        container_div.append(sufix_div);
                        container_div.addClass(INLINE_CLASS);
                        span.append(container_div);
                    } else {
                        this.$el.addClass(INLINE_CLASS);
                    }
                }
            }
        },
    };

    var FieldMask = form_widgets.FieldChar.extend(AbstractFieldMask);

    var FieldBloodPressureMask = form_widgets.FieldChar.extend(AbstractFieldMask, {
        attrsMask: {
            'contenteditable': false,
            WIDGET_: 'mask',
            DATA_INPUTMASK_DIASTOLIC_MIN: 105,
            DATA_INPUTMASK_DIASTOLIC_MAX: 160,
            DATA_INPUTMASK_SYSTOLIC_MIN: 60,
            DATA_INPUTMASK_SYSTOLIC_MAX: 100,
            DATA_INPUTMASK_BLOODPRESSURE_MEASURE: 'mmHg/mmHg',
            DATA_INPUTMASK_AUTOUNMASK: false,
            DATA_INPUTMASK_AUTOGROUP: false,
            DATA_INPUTMASK_SEPARATOR: _t.database.parameters.thousands_sep
        },
    });
    
    var FieldIntegerMask = form_widgets.FieldFloat.extend(AbstractFieldMask, {
        attrsMask: {
            'contenteditable': false,
            'data-inputmask-alias': 'integer',
            'data-inputmask-min': -2147483648,
            'data-inputmask-max': 2147483647,
            'data-inputmask-autounmask': true,
            'data-inputmask-autogroup': true,
            'data-inputmask-groupseparator': _t.database.parameters.thousands_sep
        },
    });

    var FieldFloatMask = form_widgets.FieldFloat.extend(AbstractFieldMask, {
        attrsMask: {
            'contenteditable': false,
            'data-inputmask-alias': 'decimal',
            'data-inputmask-autounmask': true,
            'data-inputmask-autogroup': true,
            'data-inputmask-groupseparator': _t.database.parameters.thousands_sep,
            'data-inputmask-radixpoint': _t.database.parameters.decimal_point,
        },
    });

    var FieldTemperatureMask = form_widgets.FieldFloat.extend(AbstractFieldMask, {
        attrsMask: {
            'contenteditable': false,
            'data-inputmask-alias': 'decimal',
            'data-inputmask-min': -100,
            'data-inputmask-max': 100,
            'data-inputmask-scale': '°C',
            'data-inputmask-autounmask': true,
            'data-inputmask-autogroup': true,
            'data-inputmask-groupseparator': _t.database.parameters.thousands_sep,
            'data-inputmask-radixpoint': _t.database.parameters.decimal_point,
        },
    });

    var FieldRegexMask = FieldMask.extend({
        maskType: "Regex"
    });

    var ColumnMask = list_widget_registry.get('field.char').extend({
        attrsMask: {},
        $mask: undefined,
        init: function (id, tag, attrs) {
            this._super(id, tag, attrs);
            this.attrsMask = mask_attrs(attrs);
            if (this.attrsMask)
                this.$mask = $(jQuery.parseHTML(QWeb.render('Widget.mask', {widget: this}))).inputmask(undefined, {placeholder: '', greedy: false});
        },
        format: function (row_data, options) {
            var value = this._super(row_data, options);
            if(this.$mask) {
                this.$mask.val(value);
                value = this.$mask.val();
            }
            return value;
        }
    });

    var MaskWidget = kanban_widgets.AbstractField.extend({
        tagName: 'span',
        attrsMask: {},
        init: function(parent, field, $node) {
            this._super(parent, field, $node);
            this.attrsMask = mask_attrs(field.__attrs);
            if(this.attrsMask)
                this.$mask = $(jQuery.parseHTML(QWeb.render('Widget.mask', {widget: this}))).inputmask(undefined, {placeholder: '', greedy: false});
        },
        renderElement: function () {
            var value = this.field.raw_value;
            if(this.$mask)
                this.$mask.val(value);
                value = this.$mask.val();
            this.$el.text(value);
        }
    });

    core.form_widget_registry
        .add('mask', FieldMask)
        .add('integer_mask', FieldIntegerMask)
        .add('float_mask', FieldFloatMask)
        .add('mask_regex', FieldRegexMask) //@ Deprecated latest version FOR name conversion!
        .add('regex_mask', FieldRegexMask)
        .add('temperature_mask', FieldTemperatureMask)
        .add('bloodpressure_mask', FieldBloodPressureMask);

    core.form_widget_registry.add('mask_regex', FieldRegexMask);
    list_widget_registry.add('field.mask', ColumnMask);
    kanban_widgets.registry.add("mask", MaskWidget);

    return {FieldMask: FieldMask, FieldMaskRegex: FieldRegexMask, MaskWidget: MaskWidget};
});

