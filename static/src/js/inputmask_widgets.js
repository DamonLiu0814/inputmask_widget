odoo.define('web.inputmask_widgets', function (require) {
    "use strict";
    /*var bus = require('bus.bus').bus;*/
    var core = require('web.core');
    var translation = require('web.translation');
    var _t = translation._t;
    var form_widgets = require('web.form_widgets');
    var kanban_widgets = require('web_kanban.widgets');
    var WebClient = require('web.WebClient');
    var list_widget_registry = core.list_widget_registry;
    var QWeb = core.qweb;

    var suffix_value = undefined;
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
    const DATA_INPUTMASK_BLOODPRESSURE_MEASURE = 'data-inputmask-bloodpressure-measure';

    const DATA_INPUTMASK_WIDGET_ALIAS = 'widget-alias';
    
    const TEMPERATURE_WIDGET = 'temperature';
    const OXYGENSATURATION_WIDGET = 'oxygensaturation';
    const HEARTRATE_WIDGET = 'heartrate';
    const BREATHINGFRECUENCY_WIDGET = 'breathingfrecuency';
    const WEIGHT_WIDGET = 'weight';
    const HEIGHT_WIDGET = 'height';
    const HEADCIRCUNFERENCE_WIDGET = 'headcircunference';
    
    const TIPSO = 'data-tipso';

    const ERROR_CLASS = 'error';

    const SUFFIX = 'suffix';
    const CLASS = 'inline';
    const SCALE = 'scale';
    const MEASURE = 'measure';
    const MIN = 'min';
    const MAX = 'max';
    const SYSTOLIC_MIN = 'systolic-min';
    const SYSTOLIC_MAX = 'systolic-max';
    const DIASTOLIC_MIN = 'diastolic-min';
    const DIASTOLIC_MAX = 'diastolic-max';
    
    const GRAMS = 'gr';
    const KILOGRAMS = 'Kg';
    const CENTIMETERS = 'cm';
    const METERS = 'm';

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
        //  
        _render: function() {
            console.log('render value');
        },
        render_value: function () {
            this._super();
            const CE = 'contenteditable';
            parent = false;
                        
            if (this.$input !== undefined) {
                this.$input.inputmask(this.maskType,
                    { "onincomplete": function(e) {
                            console.log('inputmask incomplete');
                            if( ! e.currentTarget.inputmask.isValid()) {
                                $(this).addClass(ERROR_CLASS);
                                e.preventDefault();
                                e.stopPropagation();
                                this.value = "";
                            }
                        },
                      "oncomplete": function(e) {
                            $(this).tipso('hide');
                            $(this).removeClass(ERROR_CLASS);
                            if ($(this).attr(BLOODPRESSURE_WIDGET_ALIAS) == BLOODPRESSURE_WIDGET) {
                                var value = e.currentTarget.value.replace(/_/g, "").split("/");
                                if ( ! (parseInt(value[0]) >= $(this).attr(DATA_INPUTMASK_SYSTOLIC_MIN) 
                                    && parseInt(value[0]) <= $(this).attr(DATA_INPUTMASK_SYSTOLIC_MAX)) ||
                                     ! (parseInt(value[1]) >= $(this).attr(DATA_INPUTMASK_DIASTOLIC_MIN) 
                                    && parseInt(value[1]) <= $(this).attr(DATA_INPUTMASK_DIASTOLIC_MAX))) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    this.value = ""
                                    $(this).addClass(ERROR_CLASS);
                                    $(this).tipso('show');
                                }
                            }
                            if ($(this).attr(DATA_INPUTMASK_WIDGET_ALIAS) == HEARTRATE_WIDGET ||
                                $(this).attr(DATA_INPUTMASK_WIDGET_ALIAS) == TEMPERATURE_WIDGET ||
                                $(this).attr(DATA_INPUTMASK_WIDGET_ALIAS) == BREATHINGFRECUENCY_WIDGET ||
                                $(this).attr(DATA_INPUTMASK_WIDGET_ALIAS) == OXYGENSATURATION_WIDGET ||
                                $(this).attr(DATA_INPUTMASK_WIDGET_ALIAS) == HEIGHT_WIDGET ||
                                $(this).attr(DATA_INPUTMASK_WIDGET_ALIAS) == HEADCIRCUNFERENCE_WIDGET ||
                                $(this).attr(DATA_INPUTMASK_WIDGET_ALIAS) == WEIGHT_WIDGET) {
                                var value = e.currentTarget.value.replace(/_/g, "");
                                if ( ! (Number(value) >= Number($(this).attr(DATA_INPUTMASK_MIN))
                                     && Number(value) <= Number($(this).attr(DATA_INPUTMASK_MAX))) ) {
                                    this.value = ""
                                    $(this).addClass(ERROR_CLASS);
                                    $(this).tipso('show');
                                }
                            }
                        },
                    });
                parent = this.$input.parent();
                this.add_sufix(parent);
            } else {
                this.$el.val(this.$el.text());
                this.add_sufix(parent)
            }
            if (CE in this.node.attrs || CE in this.attrsMask)
                this.$el.inputmask(this.maskType);
        },
        addTipso: function() {
            if(TIPSO in this.node.attrs) {
                if (this.$input !== undefined) {
                    this.$input.attr(TIPSO, this.node.attrs[TIPSO]);
                    var title = this.node.attrs['name'].toUpperCase();

                    if (this.node.attrs[BLOODPRESSURE_WIDGET_ALIAS] == BLOODPRESSURE_WIDGET) {
                        var message = 'Sistólica ('+ 
                            this.attrsMask[DATA_INPUTMASK_SYSTOLIC_MIN] +' a '+ 
                            this.attrsMask[DATA_INPUTMASK_SYSTOLIC_MAX]+') <br> Diastólica ('+
                            this.attrsMask[DATA_INPUTMASK_DIASTOLIC_MIN]+' a '+ 
                            this.attrsMask[DATA_INPUTMASK_DIASTOLIC_MAX]+ ')'
                        this.$input.tipso({titleContent: title, content: message});
                            ' hasta ' + this.node.attrs[DATA_INPUTMASK_MAX] +
                            ' ' + this.node.attrs[DATA_INPUTMASK_MEASURE];
                        this.$input.tipso({titleContent: title, content: message});
                    } else if (this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == OXYGENSATURATION_WIDGET) {
                        var message = 'Oxígeno desde ' + this.node.attrs[DATA_INPUTMASK_MIN] +
                            ' hasta ' + this.node.attrs[DATA_INPUTMASK_MAX] +
                            ' ' + this.node.attrs[DATA_INPUTMASK_MEASURE];
                        this.$input.tipso({titleContent: title, content: message});
                    } else if (this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == HEARTRATE_WIDGET) {
                        var message = 'Frecuencia cardiaca ' + this.node.attrs[DATA_INPUTMASK_MIN] +
                            ' hasta ' + this.node.attrs[DATA_INPUTMASK_MAX] +
                            ' ' + this.node.attrs[DATA_INPUTMASK_MEASURE];
                        this.$input.tipso({titleContent: title, content: message});
                    } else if (this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == BREATHINGFRECUENCY_WIDGET) {
                        var message = 'Frecuencia respiratoria ' + this.node.attrs[DATA_INPUTMASK_MIN] +
                            ' hasta ' + this.node.attrs[DATA_INPUTMASK_MAX] +
                            ' ' + this.node.attrs[DATA_INPUTMASK_MEASURE];
                        this.$input.tipso({titleContent: title, content: message});
                    } else if (this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == WEIGHT_WIDGET) {
                        var message = 'Peso ' + this.node.attrs[DATA_INPUTMASK_MIN] +
                            ' hasta ' + this.node.attrs[DATA_INPUTMASK_MAX] +
                            ' ' + this.node.attrs[DATA_INPUTMASK_MEASURE];
                        this.$input.tipso({titleContent: title, content: message});
                    } else if (this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == HEIGHT_WIDGET) {
                        var message = 'Talla ' + this.node.attrs[DATA_INPUTMASK_MIN] +
                            ' hasta ' + this.node.attrs[DATA_INPUTMASK_MAX] +
                            ' ' + this.node.attrs[DATA_INPUTMASK_MEASURE];
                        this.$input.tipso({titleContent: title, content: message});
                    } else if (this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == HEADCIRCUNFERENCE_WIDGET) {
                        var message = 'Perímetro cefálico ' + this.node.attrs[DATA_INPUTMASK_MIN] +
                            ' hasta ' + this.node.attrs[DATA_INPUTMASK_MAX] +
                            ' ' + this.node.attrs[DATA_INPUTMASK_MEASURE];
                        this.$input.tipso({titleContent: title, content: message});
                    } else if (this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == TEMPERATURE_WIDGET) {
                        var message = 'Temperatura ' + this.node.attrs[DATA_INPUTMASK_MIN] +
                            ' hasta ' + this.node.attrs[DATA_INPUTMASK_MAX] +
                            ' ' + this.node.attrs[DATA_INPUTMASK_MEASURE];
                        this.$input.tipso({titleContent: title, content: message});
                    } else {
                        this.$input.tipso({titleContent: title, });
                    }
                }
            }
        },
        addAttr: function() {
            if( this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == HEARTRATE_WIDGET ||
                this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == BREATHINGFRECUENCY_WIDGET ||
                this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == TEMPERATURE_WIDGET ||
                this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == OXYGENSATURATION_WIDGET ||
                this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == HEADCIRCUNFERENCE_WIDGET ||
                this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == HEIGHT_WIDGET ||
                this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == WEIGHT_WIDGET) {
                if (this.$input !== undefined) {
                    if(DATA_INPUTMASK_MIN in this.node.attrs) {
                        this.$input.attr(DATA_INPUTMASK_MIN, this.node.attrs[DATA_INPUTMASK_MIN]);
                        this.attrsMask[DATA_INPUTMASK_MIN] = this.node.attrs[DATA_INPUTMASK_MIN];
                    }
                    if(DATA_INPUTMASK_MAX in this.node.attrs) {
                        this.$input.attr(DATA_INPUTMASK_MAX, this.node.attrs[DATA_INPUTMASK_MAX]);
                        this.attrsMask[DATA_INPUTMASK_MAX] = this.node.attrs[DATA_INPUTMASK_MAX];
                    }
                    if(DATA_INPUTMASK_MEASURE in this.node.attrs) {
                        this.$input.attr(DATA_INPUTMASK_MEASURE, this.node.attrs[DATA_INPUTMASK_MEASURE]);
                        this.attrsMask[DATA_INPUTMASK_MEASURE] = this.node.attrs[DATA_INPUTMASK_MEASURE];
                    }
                    if(DATA_INPUTMASK_WIDGET_ALIAS in this.node.attrs) {
                        this.$input.attr(DATA_INPUTMASK_WIDGET_ALIAS, this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS]);
                    }
                }
                if(DATA_INPUTMASK_MEASURE in this.node.attrs) {
                    if (this.node.attrs[DATA_INPUTMASK_MEASURE]) {
                        suffix_value = this.node.attrs[DATA_INPUTMASK_MEASURE]
                    }
                } else {
                    suffix_value = this.attrsMask[DATA_INPUTMASK_MEASURE];
                }
            }
            var age_patient = parseInt(this.view.datarecord.age_patient.split(' '));
            if (age_patient == 0 ) {
                if(this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == WEIGHT_WIDGET) {
                    if (this.$input !== undefined) this.$input.attr(DATA_INPUTMASK_MEASURE, GRAMS);
                    suffix_value = GRAMS;
                }
                if(this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == HEIGHT_WIDGET) {
                    if (this.$input !== undefined) this.$input.attr(DATA_INPUTMASK_MEASURE, CENTIMETERS);
                    suffix_value = CENTIMETERS;
                }
                this.addTipso();
            } else {
                var new_mask = '';
                if(this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == WEIGHT_WIDGET) {
                    if (this.$input !== undefined) { 
                        new_mask = "9[99" + _t.database.parameters.decimal_point + "99]";
                        this.$input.attr(DATA_INPUTMASK_MEASURE, KILOGRAMS);
                        this.$input.attr(DATA_INPUTMASK_MASK, "9[99.99]");
                        this.$input.attr(DATA_INPUTMASK_MIN, 1);
                        this.$input.attr(DATA_INPUTMASK_MAX, 250);
                        this.$input.inputmask('remove');

                        var imputmask = new Inputmask("9[99.99]", {
                            positionCaretOnClick: "radixFocus",
                            radixPoint: ".",
                            _radixDance: true,
                            numericInput: true,
                            placeholder: "0",
                            definitions: {
                                "0": {
                                    validator: "[0-9\uFF11-\uFF19]"
                                }
                            },
                            "onincomplete": function(e) {
                                console.log('inputmask incomplete');
                                var value = e.currentTarget.value.replace(/_/g, "");
                                if ( ! (Number(value) >= Number($(this).attr(DATA_INPUTMASK_MIN))
                                    && Number(value) <= Number($(this).attr(DATA_INPUTMASK_MAX))) ) {
                                    this.value = ""
                                    $(this).addClass(ERROR_CLASS);
                                    $(this).tipso('show');
                                }
                            },
                            "oncomplete": function(e) {
                                console.log('inputmask complete');
                                var value = e.currentTarget.value.replace(/_/g, "");
                                if ( ! (Number(value) >= Number($(this).attr(DATA_INPUTMASK_MIN))
                                    && Number(value) <= Number($(this).attr(DATA_INPUTMASK_MAX))) ) {
                                    this.value = ""
                                    $(this).addClass(ERROR_CLASS);
                                    $(this).tipso('show');
                                }
                            },
                        });
                        imputmask.mask(this.$input);
                        var message = 'Peso ' + this.$input.attr(DATA_INPUTMASK_MIN) +
                            ' hasta ' + this.$input.attr(DATA_INPUTMASK_MAX) +
                            ' ' + KILOGRAMS;
                        this.$input.tipso('destroy');
                        this.$input.tipso({titleContent: this.node.attrs['name'].toUpperCase(), content: message});
                    }
                    suffix_value = KILOGRAMS;
                } 
                if(this.node.attrs[DATA_INPUTMASK_WIDGET_ALIAS] == HEIGHT_WIDGET) {
                    if (this.$input !== undefined) {
                        new_mask = "9[" + _t.database.parameters.decimal_point + "99]";
                        this.$input.attr(DATA_INPUTMASK_MEASURE, METERS);
                        this.$input.attr(DATA_INPUTMASK_MASK, "9[.99]");
                        this.$input.attr(DATA_INPUTMASK_MIN, 0.3);
                        this.$input.attr(DATA_INPUTMASK_MAX, 3.5);
                        this.$input.inputmask('remove');

                        var imputmask = new Inputmask("9[.99]", {
                            positionCaretOnClick: "radixFocus",
                            radixPoint: ".",
                            _radixDance: true,
                            numericInput: true,
                            placeholder: "0",
                            definitions: {
                                "0": {
                                    validator: "[0-9\uFF11-\uFF19]"
                                }
                            },
                            "onincomplete": function(e) {
                                console.log('inputmask incomplete');
                                var value = e.currentTarget.value.replace(/_/g, "");
                                if ( ! (Number(value) >= Number($(this).attr(DATA_INPUTMASK_MIN))
                                    && Number(value) <= Number($(this).attr(DATA_INPUTMASK_MAX))) ) {
                                    this.value = ""
                                    $(this).addClass(ERROR_CLASS);
                                    $(this).tipso('show');
                                }
                            },
                            "oncomplete": function(e) {
                                console.log('inputmask complete');
                                var value = e.currentTarget.value.replace(/_/g, "");
                                if ( ! (Number(value) >= Number($(this).attr(DATA_INPUTMASK_MIN))
                                    && Number(value) <= Number($(this).attr(DATA_INPUTMASK_MAX))) ) {
                                    this.value = ""
                                    $(this).addClass(ERROR_CLASS);
                                    $(this).tipso('show');
                                }
                            },
                        });
                        imputmask.mask(this.$input);
                        var message = 'Talla ' + this.$input.attr(DATA_INPUTMASK_MIN) +
                            ' hasta ' + this.$input.attr(DATA_INPUTMASK_MAX) +
                            ' ' + METERS;
                        this.$input.tipso('destroy');
                        this.$input.tipso({titleContent: this.node.attrs['name'].toUpperCase(), content: message});
                    }
                    suffix_value = METERS;
                }
            }
            if(this.node.attrs[BLOODPRESSURE_WIDGET_ALIAS] == BLOODPRESSURE_WIDGET) {
                if(BLOODPRESSURE_WIDGET_ALIAS in this.node.attrs) {
                    if (this.$input !== undefined) this.$input.attr(BLOODPRESSURE_WIDGET_ALIAS, this.node.attrs[BLOODPRESSURE_WIDGET_ALIAS]);
                }
                if(MIN in this.node.attrs && MAX in this.node.attrs) {
                    this.attrsMask[DATA_INPUTMASK_DIASTOLIC_MIN] = this.node.attrs[MIN],
                    this.attrsMask[DATA_INPUTMASK_DIASTOLIC_MAX] = this.node.attrs[MAX]
                    this.attrsMask[DATA_INPUTMASK_SYSTOLIC_MIN] = this.node.attrs[MIN],
                    this.attrsMask[DATA_INPUTMASK_SYSTOLIC_MAX] = this.node.attrs[MAX]
                }
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
                if(DATA_INPUTMASK_BLOODPRESSURE_MEASURE in this.node.attrs) {
                    if (this.node.attrs[DATA_INPUTMASK_BLOODPRESSURE_MEASURE]) {
                        suffix_value = this.node.attrs[DATA_INPUTMASK_BLOODPRESSURE_MEASURE]
                    }
                } else {
                    suffix_value = this.attrsMask[DATA_INPUTMASK_BLOODPRESSURE_MEASURE];
                }
            }
            if(this.$input !== undefined) {
                this.$input.focusout(function(e) {
                    $(this).tipso('hide');
                });
                this.$input.focus(function(e) {
                    $(this).tipso('show');
                });
                this.$input.keypress(function(e) {
                    $(this).tipso('show');
                });
                this.$input.mouseover(function(e) {
                    $(this).tipso('show');
                })
            }
        },
        add_sufix: function (parent=false) {
            this.addTipso();
            this.addAttr();
            if (SUFFIX in this.node.attrs) {
                if (this.node.attrs[SUFFIX] == "true" || this.node.attrs[SUFFIX] == "1") {
                    var suffix = $("<span class='mask-suffix input-group-text'></span>").text(suffix_value);
                    var container_div = $('<div class="input-group mb-3"></div>');
                    var prefix_div = $('<div class="input-group-prepend"></div>');
                    var sufix_div = $('<div class="input-group-append"></div>');
                    
                    var domElement = $( this ).get( 0 );
                    var span = domElement.$el.parent()
                    if(span.is('td')) {
                        sufix_div.append(suffix);
                        container_div.append(prefix_div);
                        this.$el.addClass(CLASS);
                        this.$el.detach().appendTo(container_div);
                        container_div.append(sufix_div);
                        container_div.addClass(CLASS);
                        span.append(container_div);
                    } else {
                        this.$el.addClass(CLASS);
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

