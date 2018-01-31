// Copyright 2012 Dmitry Monin. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Textarea control
 * Extends native {goog.ui.Textarea} with IControl interface
 */

goog.provide('morning.forms.Textarea');

goog.require('goog.ui.Control');
goog.require('goog.ui.Textarea');
goog.require('goog.ui.registry');
goog.require('morning.forms.IControl');


/**
 * A textarea control to handle growing/shrinking with textarea.value.
 *
 * @param {string} content Text to set as the textarea's value.
 * @param {goog.ui.TextareaRenderer=} opt_renderer Renderer used to render or
 *   decorate the textarea. Defaults to {@link goog.ui.TextareaRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *   document interaction.
 * @constructor
 * @extends {goog.ui.Textarea}
 * @implements {morning.forms.IControl}
 */
morning.forms.Textarea = function(content, opt_renderer, opt_domHelper)
{
  goog.base(this, content, opt_renderer, opt_domHelper);

  this.addClassName('form-control');

  /**
   * @type {goog.async.Delay}
   * @private
   */
  this.changeDelay_ = new goog.async.Delay(this.update_, 300, this);

  /**
   * @type {goog.async.Delay}
   * @private
   */
  this.resizeDelay_ = new goog.async.Delay(this.resize, 150, this);

  /**
   * @type {boolean}
   * @private
   */
  this.delayChangeEvent_ = true;

  /**
   * @type {string}
   * @private
   */
  this.fieldName = '';

  /**
   * @type {*}
   * @private
   */
  this.value_ = '';

  /**
   * @type {string}
   * @private
   */
  this.placeholder_ = '';
};
goog.inherits(morning.forms.Textarea, goog.ui.Textarea);

/** @inheritDoc */
morning.forms.Textarea.prototype.decorateInternal = function(el)
{
  goog.base(this, 'decorateInternal', el);

  this.fieldName = el.name;

  if (this.className_)
  {
    goog.dom.classlist.add(el, this.className_);
  }

};

/** @override **/
morning.forms.Textarea.prototype.enterDocument = function()
{
  goog.base(this, 'enterDocument');

  var el = this.getElement();

  if (this.placeholder_)
  {
    el.placeholder = this.placeholder_;
  }

  this.getHandler().listen(el, [
    goog.events.EventType.FOCUS,
    goog.events.EventType.BLUR
  ], this.handleFocus_);

  this.getHandler()
    .listen(el, goog.events.EventType.KEYDOWN, this.handleKeyDown_)
    .listen(el, goog.events.EventType.KEYUP, this.handleKeyUp_)
    .listen(el, goog.events.EventType.CHANGE, this.update_);

  this.resizeDelay_.start();
};

/**
 * Returns field name
 *
 * @return {string}
 */
morning.forms.Textarea.prototype.getFieldName = function()
{
  return this.fieldName;
};

/**
 * Handles user focus on textarea
 *
 * @param {goog.events.BrowserEvent} e
 * @private
 */
morning.forms.Textarea.prototype.handleFocus_ = function(e)
{
  this.dispatchEvent(e.type);
};

/**
 * Handles keydown event
 *
 * @param {goog.events.BrowserEvent} e
 * @private
 */
morning.forms.Textarea.prototype.handleKeyDown_ = function(e)
{
  this.dispatchEvent(goog.events.EventType.KEYDOWN);
};

/**
 * Handles key up events and forces change event
 *
 * @param {goog.events.BrowserEvent} e
 * @private
 */
morning.forms.Textarea.prototype.handleKeyUp_ = function(e)
{
  this.dispatchEvent(goog.events.EventType.KEYUP);

  if (this.delayChangeEvent_)
  {
    this.changeDelay_.start();
  }
  else
  {
    this.update_();
  }
};

/**
 * Resets textarea value
 */
morning.forms.Textarea.prototype.reset = function()
{
  this.getElement().value = '';
};


/**
 * Sets textarea configuration
 *
 * @param {Object} config
 */
morning.forms.Textarea.prototype.setConfig = function(config)
{
  if (goog.isDef(config['delayChangeEvent']))
  {
    this.delayChangeEvent_ = !!config['delayChangeEvent'];
  }

  if (goog.isDef(config['className']))
  {
    this.addClassName(config['className']);
  }

  if (goog.isDef(config['fieldName']))
  {
    this.fieldName = config['fieldName'];
  }

  if (goog.isDef(config['placeholder']))
  {
    this.placeholder_ = config['placeholder'];
    if (this.getElement())
    {
      this.getElement()['placeholder'] = this.placeholder_;
    }
  }
};

/**
 *
 * @param {boolean} isInvalid
 */
morning.forms.Textarea.prototype.setInvalid = function(isInvalid)
{
  goog.dom.classlist.enable(this.getElement(), 'invalid', isInvalid);
};

/**
 * @param {*} value
 */
morning.forms.Textarea.prototype.setValue = function(value)
{
  value = value || '';
  if (this.getElement() && this.getElement().value != value)
  {
    goog.base(this, 'setValue', value);
    this.value_ = /** @type {string} */ (value);
  }
};

/**
 * @private
 */
morning.forms.Textarea.prototype.update_ = function()
{
  if (this.value_ != this.getValue())
  {
    this.value_ = this.getValue();
    this.dispatchEvent(goog.events.EventType.CHANGE);
  }
};


/**
 * Register this control so it can be created from markup.
 */
goog.ui.registry.setDecoratorByClassName(
  'textarea',
  function() {
    return new morning.forms.Textarea('');
  });
