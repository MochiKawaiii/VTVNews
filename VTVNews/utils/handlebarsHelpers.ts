/**
 * Handlebars Helper Functions
 */

// Register helpers with Handlebars
export const registerHelpers = (handlebars: any) => {
  // Equality check
  handlebars.registerHelper('eq', function (a: any, b: any) {
    return a === b;
  });

  // Greater than
  handlebars.registerHelper('gt', function (a: any, b: any) {
    return a > b;
  });

  // Less than
  handlebars.registerHelper('lt', function (a: any, b: any) {
    return a < b;
  });

  // Format date
  handlebars.registerHelper('formatDate', function (date: string) {
    if (!date) return '';

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };

    return new Date(date).toLocaleDateString('vi-VN', options);
  });

  // Truncate text
  handlebars.registerHelper('truncate', function (text: string, length: number) {
    if (!text) return '';

    if (text.length <= length) return text;

    return text.substring(0, length) + '...';
  });

  // Add two numbers
  handlebars.registerHelper('add', function (a: number, b: number) {
    return a + b;
  });

  // Subtract two numbers
  handlebars.registerHelper('subtract', function (a: number, b: number) {
    return a - b;
  });
};
