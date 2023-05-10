/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'color-primary': 'var(--color-primary)',
        'color-secondary': 'var(--color-secondary)',
        'color-success': 'var(--color-success)',
        'color-info': 'var(--color-info)',
        'color-warning': 'var(--color-warning)',
        'color-danger': 'var(--color-danger)',
        'color-light': 'var(--color-light)',
        'color-dark': 'var(--color-dark)',
        'body-color': 'var(--body-color)',
        'link-color': 'var(--link-color)',
        'link-hover-color': 'var(--link-hover-color)',
        'code-color': 'var(--code-color)',
        'highlight-bg': 'var(--highlight-bg)',
        'font-color': 'var(--font-color)',
        'gray-color': 'var(--gray-color)',
        'gray-color-hover': 'var(--gray-color-hover)',

        /* form */
        'default-color': 'var(--default-color)',

        /* menu */
        'menu-active-color': 'var(--menu-active-color)',
      },
      backgroundColor: {
        light: 'var(--light-bg)',
        highlight: 'var(--highlight-bg)',
        body: 'var(--body-bg)',
        base: 'var(--background-color)',
        'menu-active': 'var(--menu-active-bg)',
        'modal-body': 'var(--modal-body-bg)',
        'modal-header': 'var(--modal-header-bg)',
        'form-inset': 'var(--form-inset-bg)',
        'card-body': 'var(--card-body-bg)',
        'card-header': 'var(--card-header-bg)',
      },
      borderRadius: {
        sm: 'var(--border-radius-sm)',
        lg: 'var(--border-radius-lg)',
        xl: 'var(--border-radius-xl)',
        '2xl': 'var(--border-radius-2xl)',
        pill: 'var(--border-radius-pill)',
      },
      padding: {
        'button-x': 'var(--button-padding-x)',
        'button-y': 'var(--button-padding-y)',
        'card-x': 'var(--card-padding-x)',
        'card-y': 'var(--card-padding-y)',
      },
      fontSize: {
        DEFAULT: 'var(--body-font-size)',
      },

      boxShadow: {
        DEFAULT: 'var(--box-shadow)',
      },

      backgroundImage: {
        base: 'var(--background-image)',
      },

      fontWeight: {
        body: 'var(--body-font-weight)',
      },

      lineHeight: {
        body: 'var(--body-line-height)',
      },

      borderWidth: {
        DEFAULT: 'var(--border-width)',
      },

      borderColor: {
        translucent: 'var(--border-color-translucent)',
        DEFAULT: 'var(--border-color)',
      },
    },
  },
  plugins: [require('@headlessui/tailwindcss')],
  corePlugins: {
    preflight: false,
  },
};
