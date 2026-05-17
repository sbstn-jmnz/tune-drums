import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import TunerDisplay from '../../src/components/TunerDisplay.vue'

describe('TunerDisplay.vue', () => {
  const factory = () =>
    mount(TunerDisplay, {
      props: {
        frequency: 110,
        note: 'A2',
        cents: 3,
        diff: 0.5,
        volume: 80,
        targetFreq: 110,
      },
    })

  it('renders frequency', () => {
    const wrapper = factory()

    expect(wrapper.text()).toContain('110')
  })

  it('renders note', () => {
    const wrapper = factory()

    expect(wrapper.text()).toContain('A2')
  })

  it('renders cents', () => {
    const wrapper = factory()

    expect(wrapper.text()).toContain('3 cents')
  })
})