import { config } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

// Stub NuxtLink for tests — renders as <a> with to → href
config.global.stubs = {
  NuxtLink: defineComponent({
    props: { to: { type: [String, Object], default: '' } },
    setup(props, { slots }) {
      const href = typeof props.to === 'string' ? props.to : ''
      return () => h('a', { href }, slots.default?.())
    },
  }),
}
