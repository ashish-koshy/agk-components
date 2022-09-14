
import {
  h,
  JSX,
  Prop,
  Host,
  State,
  Event,
  Method,
  Element,
  Component,
  EventEmitter,
} from '@stencil/core'
import { generateSimpleID } from '../../utils/utils'

import Constants from './constants'

@Component({
  tag: 'agk-menu',
  styleUrl: 'agk-menu.scss',
  shadow: true,
})
export class AgkMenu {

  @Prop() name: string

  @Prop() label: string

  @Prop() options: string

  @Prop() disabled: boolean

  @Prop() hasError: boolean

  @Prop() errorText: string

  @Prop() placeHolder: string

  @Prop() autoIdentifier: string

  @Prop({ mutable: true }) value = ''

  @Event() agkMenuBlur: EventEmitter

  @Event() agkMenuFocus: EventEmitter

  @Event() agkMenuChange: EventEmitter

  @Method() async setFocus(): Promise<void> {
    const element = this.getElementByUniqueClassName(`${Constants.tag}--selection`)
    if (!this.disabled && element && element.focus) {
      element.focus({ preventScroll: true })
      this.handleOnFocus()
    }
  }

  @Element() private menu: HTMLElement

  @State() private identifier = ''

  @State() private menuInFocus = false

  @State() private menuVisible = false

  constructor() {
    this.identifier = this.autoIdentifier || generateSimpleID()
  }

  private getElementByUniqueClassName(uniqueClassName: string): HTMLElement {
    const collection = this.menu?.shadowRoot?.lastElementChild?.getElementsByClassName(
      `${uniqueClassName}`,
    ) as HTMLCollectionOf<HTMLElement>
    return collection[0] || undefined
  }

  private handleKeyboardSelection(element: HTMLElement, select: boolean = true): void {
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      element.focus()
      if (select) 
        this.selectMenuItem(
          element.getAttribute('data-item-value'),
          element.getAttribute('data-item-group'),
        )
    }
  }

  private handleFocusOut(event: FocusEvent): void {
    if (!this.menu?.shadowRoot?.lastElementChild?.contains(event.relatedTarget as Node)) {
      this.menuVisible = false
      this.handleOnBlur()
    }
  }

  private handleOnChange(itemValue: string, groupTitle?: string): void {
    if (groupTitle) {
      this.agkMenuChange.emit(JSON.stringify({ [`${groupTitle}`]: itemValue }))
      return
    }
    this.agkMenuChange.emit(itemValue)
  }

  private handleOnFocus(): void {
    if (!this.menuInFocus) {
      this.menuInFocus = true
      this.agkMenuFocus.emit()
    }
  }

  private handleOnBlur(): void {
    if (!this.menuVisible && this.menuInFocus) {
      this.menuInFocus = false
      this.agkMenuBlur.emit()
    }
  }

  private getActiveItem(): HTMLElement {
    const activeElement: HTMLElement = this.getElementByUniqueClassName(
      `${Constants.tag}--${'item-active'}`,
    )
    if (!activeElement) {
      const firstItem = this.getElementByUniqueClassName(
        `${Constants.tag}--${'items'}`,
      )?.firstElementChild?.firstElementChild
      if (firstItem?.tagName === 'BUTTON') return firstItem as HTMLElement
      return firstItem?.firstElementChild?.nextElementSibling as HTMLElement
    }
    return activeElement
  }

  private selectFirstMenuItem(select: boolean = false): void {
    const items = this.getElementByUniqueClassName(`${Constants.tag}--items`)
    const firstItem: HTMLButtonElement = items?.firstElementChild?.querySelector(
      'button',
    )
    this.handleKeyboardSelection(firstItem, select)
  }

  private selectLastMenuItem(): void {
    const items = this.getElementByUniqueClassName(`${Constants.tag}--items`)
    let lastItem = items?.lastElementChild?.lastElementChild as HTMLElement
    if (lastItem?.tagName !== 'BUTTON')
      lastItem = lastItem?.lastElementChild as HTMLElement
    this.handleKeyboardSelection(lastItem)
  }

  private selectCurrentMenuItem(): void {
    const currentItem = this.getElementByUniqueClassName(
      `${Constants.tag}--${'item-active'}`,
    )
    this.handleKeyboardSelection(currentItem, false)
  }

  private selectNextMenuItem(): void {
    let nextItem!: HTMLElement
    const activeItem: HTMLElement = this.getActiveItem()
    if (activeItem?.nextElementSibling?.tagName === 'BUTTON')
      nextItem = activeItem?.nextElementSibling as HTMLElement
    else {
      let parentElement: HTMLElement = activeItem?.parentElement
      if (activeItem?.parentElement?.tagName === 'DIV')
        parentElement = activeItem?.parentElement?.parentElement
      nextItem = parentElement?.nextElementSibling
        ?.firstElementChild as HTMLElement
      if (nextItem?.tagName === 'DIV')
        nextItem = nextItem?.firstElementChild
          ?.nextElementSibling as HTMLElement
    }
    this.handleKeyboardSelection(nextItem)
  }

  private selectPreviousMenuItem(): void {
    let previousItem!: HTMLElement
    const activeItem: HTMLElement = this.getActiveItem()
    if (activeItem?.previousElementSibling?.tagName === 'BUTTON')
      previousItem = activeItem?.previousElementSibling as HTMLElement
    else {
      let parentElement: HTMLElement = activeItem?.parentElement
      if (parentElement?.tagName === 'DIV')
        parentElement = parentElement?.parentElement
      previousItem = parentElement?.previousElementSibling
        ?.lastElementChild as HTMLElement
      if (previousItem?.tagName === 'DIV')
        previousItem = previousItem?.lastElementChild as HTMLElement
    }
    this.handleKeyboardSelection(previousItem)
  }

  private handleKeyboardEvent(event: KeyboardEvent): void {
    switch (event?.key) {
      case 'Tab':
        this.menuVisible = false
        break
      case 'ArrowDown':
        this.selectNextMenuItem()
        break
      case 'ArrowUp':
        this.selectPreviousMenuItem()
        break
      case 'End':
        this.selectLastMenuItem()
        break
      case 'Home':
        this.selectFirstMenuItem(true)
        break
      case 'Enter':
        this.toggleMenu()
        this.setFocus()
        break
      case 'Escape':
        this.menuVisible = false
        this.setFocus()
        break
      default:
        break
    }
  }

  private getMenuData(): {
    [parent: string]: string | { [child: string]: string }
  } {
    try {
      return JSON.parse(this.options)
    } catch {
      return {}
    }
  }

  private getMenuItem(itemValue: string, groupTitle?: string): void {
    const isActive = itemValue === this.value
    return (
      <button
        tabIndex={-1}
        aria-label={`Select menu item - ${itemValue} ${
          groupTitle ? `of group - ${groupTitle}` : ''
        }`}
        class={`${Constants.tag}--${'item'} ${
          isActive ? `${Constants.tag}--${'item-active'}` : ''
        }`}
        onFocus={(): void => this.handleOnFocus()}
        onClick={(): void => this.selectMenuItem(itemValue, groupTitle, true)}
        onBlur={(event: FocusEvent): void => this.handleFocusOut(event)}
        onKeyUp={(event: KeyboardEvent): void =>
          this.handleKeyboardEvent(event)
        }
        data-item-value={itemValue}
        data-item-group={groupTitle}
      >
        <p aria-label={`Menu item - ${itemValue} ${isActive ? 'is active' : ''}`}>
          {itemValue}
        </p>
        {((): JSX.Element | undefined => {
          if (isActive)
            return (
              <img
                draggable={false}
                alt={`Decorative icon for active menu item - ${itemValue}`}
                aria-label={`Decorative icon for active menu item - ${itemValue}`}
                src={`${Constants.icons.check}`}
              ></img>
            )
          return undefined
        })()}
      </button>
    )
  }

  private getMenuItemGroup(
    groupTitle: string,
    child: { [key: string]: string },
  ): void {
    return (
      <div
        role="textbox"
        aria-label={`Container for menu item group`}
        class={`${Constants.tag}--${'item-group'}`}
      >
        <div
          aria-label={`Container for menu item group title - ${groupTitle}`}
          class={`${Constants.tag}--${'item-group-title'}`}
          role="textbox"
        >
          <p aria-label={`Menu item group - ${groupTitle}`}>
            <b>{groupTitle}</b>
          </p>
        </div>
        {Object.keys(child || {}).map(childKey =>
          this.getMenuItem(child[childKey], groupTitle),
        )}
      </div>
    )
  }

  private getMenuBody(): JSX.Element {
    const menuData = this.getMenuData()
    return (
      <ul
        aria-label="List of items"
        class={`${Constants.tag}--${'items'} ${
          !this.menuVisible ? `${Constants.tag}--${'hidden'}` : ''
        }`}
      >
        {Object.keys(menuData || {}).map(key => {
          const itemValue = menuData[key] || undefined
          if (itemValue)
            return (
              <li>
                {typeof itemValue === 'string'
                  ? this.getMenuItem(itemValue)
                  : this.getMenuItemGroup(key, itemValue)}
              </li>
            )
          return undefined
        })}
      </ul>
    )
  }

  private getSelectedValue(): JSX.Element {
    return (
      <div
        role="button"
        class={`${Constants.tag}--${'selection-value'}`}
        aria-label={`Container for selected value`}
      >
        <p 
          aria-label={`Selected value - ${this.value || ''}`} 
          class={`${Constants.tag}--${'selection-value-text'}`}>
          {this.value || this.placeHolder || 'Select'}
        </p>
        <img
          draggable={false}
          alt={`Decorative icon for menu toggle state`}
          src={`${this.menuVisible ? Constants.icons.up : Constants.icons.down}`}>
        </img>
      </div>
    )
  }

  private getLabel(): JSX.Element {
    return this.value && this.label ? (
      <p
        class={`${Constants.tag}--${'selection-label'}`}
        aria-labelledby={this.name || ''}
        aria-label="Menu label"
      >
        {this.label}
      </p>
    ) : (
      undefined
    )
  }

  private getError(): JSX.Element {
    return this.hasError && this.errorText ? (
      <div class={`${Constants.tag}--${'error-text'}`}>
        <p
          aria-labelledby={this.name || ''}
          aria-label="Menu error label"
        >
          {this.errorText}
        </p>
      </div>
    ) : (
      undefined
    )
  }

  private selectMenuItem(
    itemValue: string, 
    groupTitle?: string, 
    closeMenu?: boolean
  ): void {
    this.value = itemValue
    this.handleOnChange(itemValue, groupTitle)
    if (closeMenu) {
      setTimeout(() => (this.menuVisible = false), Constants.renderDelay)
      this.setFocus()
    }
  }

  private toggleMenu(): void {
    this.menuVisible = !this.menuVisible
    setTimeout(() => {
      if (this.menuVisible)
        if (!this.value) this.selectFirstMenuItem()
        else this.selectCurrentMenuItem()
    }, Constants.renderDelay)
  }

  public render(): JSX.Element {
    return (
      <Host aria-haspopup="true">
        <div class={`${Constants.tag}--host`}>
          <div
            role="button"
            tabIndex={this.disabled ? -1 : 0}
            data-automation-label={this.identifier}
            aria-label="Toggle menu"
            aria-labelledby={this.name || ''}
            aria-disabled={this.disabled ? 'true' : 'false'}
            onClick={(): void => !this.disabled && this.toggleMenu()}
            onBlur={(): void => !this.disabled && this.handleOnBlur()}
            onFocus={(): void => !this.disabled && this.handleOnFocus()}
            class={`${Constants.tag}--selection ${
              this.disabled ? `${Constants.tag}--disabled` : ''
            } ${this.getError() ? `${Constants.tag}--error` : ''}`}
            onFocusout={(event: FocusEvent): void =>
              !this.disabled && this.handleFocusOut(event)
            }
            onKeyUp={(event: KeyboardEvent): void =>
              !this.disabled && this.handleKeyboardEvent(event)
            }
          >
            {this.getLabel()}
            {this.getSelectedValue()}
          </div>
          {this.getMenuBody()}
          {this.getError()}
        </div>
      </Host>
    )
  }
}
