import MyAccountSetup from './AccountSetup.vue';
import { NCollapse } from 'naive-ui'

export default {
  title: '/MyAccountSetup',
  component: MyAccountSetup,
  argTypes: {
    onGetCreatedWallet: { action: 'walletCreated' },
  },
};

export const Default = {
  render: () => ({
    components: { MyAccountSetup, NCollapse },
    template: '<n-collapse><my-account-setup /></n-collapse>',
  }),
};
