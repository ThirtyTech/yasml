// .storybook/manager.js

import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';
import { create } from '@storybook/theming/create';

addons.setConfig({
    theme: create({
        brandTitle: 'YASML',
        brandImage: './yasml.png',
    }),
});
