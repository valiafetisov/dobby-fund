import MyCryptoBuy from './CryptoBuy.vue';
import { NCollapse } from 'naive-ui';
import { action } from '@storybook/addon-actions';

export default {
  title: '/CryptoBuy',
  component: MyCryptoBuy,
};

export const Default = {
  render: () => ({
    components: { MyCryptoBuy, NCollapse },
    methods: { getCreatedWallet: action('get-created-wallet') },
    template: `<n-collapse><MyCryptoBuy @get-created-wallet="getCreatedWallet" /></n-collapse>`,
  }),
};
