import MyAccountSetup from './AccountSetup.vue';
import { NCollapse } from 'naive-ui';
import { action } from '@storybook/addon-actions';

export default {
  title: '/MyAccountSetup',
  component: MyAccountSetup,
};

export const Default = {
  render: () => ({
    components: { MyAccountSetup, NCollapse },
    methods: { getCreatedWallet: action('get-created-wallet') },
    template: `<n-collapse><MyAccountSetup @get-created-wallet="getCreatedWallet" /></n-collapse>`,
  }),
};
