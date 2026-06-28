import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '../BaseButton.vue'

describe('BaseButton', () => {
  it('renders as a <button> when no to prop', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'primary' },
      slots: { default: 'Click' },
    })
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).toBe('Click')
  })

  it('renders as a <NuxtLink> when to prop is provided', () => {
    const wrapper = mount(BaseButton, {
      props: { to: '/tests/foo' },
      slots: { default: 'Go' },
    })
    // NuxtLink renders as <a> in tests (no Nuxt runtime)
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.attributes('href')).toBe('/tests/foo')
    expect(wrapper.text()).toBe('Go')
  })

  it('applies variant class', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'outline' },
      slots: { default: 'X' },
    })
    expect(wrapper.classes()).toContain('btn-outline')
  })

  it('applies size class', () => {
    const wrapper = mount(BaseButton, {
      props: { size: 'sm' },
      slots: { default: 'X' },
    })
    expect(wrapper.classes()).toContain('btn-sm')
  })

  it('sets disabled attribute on button', () => {
    const wrapper = mount(BaseButton, {
      props: { disabled: true },
      slots: { default: 'X' },
    })
    const btn = wrapper.find('button')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('does not set disabled on link variant', () => {
    const wrapper = mount(BaseButton, {
      props: { to: '/x', disabled: true },
      slots: { default: 'X' },
    })
    const a = wrapper.find('a')
    // disabled not passed as attribute on NuxtLink (non-button)
    expect(a.attributes('disabled')).toBeUndefined()
  })
})
