import MyAccountSetup from './AccountSetup.vue';

export default {
  title: '/MyAccountSetup',
  component: MyAccountSetup,
  argTypes: {
    onGetCreatedWallet: { action: 'walletCreated' },
  },
};

export const Default = {};
