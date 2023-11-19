import MyAccountPresentation from './AccountPresentation.vue'
import { NCollapse } from 'naive-ui'
import { action } from '@storybook/addon-actions'

export default {
  title: '/AccountPresentation',
  component: MyAccountPresentation,
}

export const Default = {
  args: {
    accountAddress: '0x1234567890123456789012345678901234567890',
    accountPrivateKey: 'E9873D79C6D87DC0FB6A5778633389F4453213303DA61F20BD67FC233AA33262',
    accountGenerationDate: new Date(),
    archivedPartsCount: 3,
    archivedPartsThreshold: 2,
    accountBalances: [{ chain: 'mainnet', balance: '10' }],
  },
  render: (args: any) => ({
    components: { MyAccountPresentation, NCollapse },
    // methods: { generated: action('generated'), updateConfirmed: action('updateConfirmed') },
    setup: () => ({
      ...args,
    }),
    template: `<n-collapse display-directive="show"><MyAccountPresentation :accountAddress="accountAddress" :accountPrivateKey="accountPrivateKey" :accountGenerationDate="accountGenerationDate" :archivedPartsCount="archivedPartsCount" :archivedPartsThreshold="archivedPartsThreshold" :accountBalances="accountBalances" /></n-collapse>`,
  }),
}
