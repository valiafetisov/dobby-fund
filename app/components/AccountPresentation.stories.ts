import MyAccountPresentation from './AccountPresentation.vue'
import { NCollapse } from 'naive-ui'

export default {
  title: '/MyAccountPresentation',
  component: MyAccountPresentation,
  argTypes: {
    generated: { action: 'generated' },
    updateConfirmed: { action: 'updateConfirmed' },
  },
}

export const Default = {
  args: {
    archivedPartsCount: 3,
    archivedPartsThreshold: 2,
    accountGenerationDate: '2021-01-01',
    accountBalances: [],
  },
  render: () => ({
    components: { MyAccountPresentation, NCollapse },
    template: '<n-collapse display-directive="show" ><MyAccountPresentation /></n-collapse>',
  }),
}
