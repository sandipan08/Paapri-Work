/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 */
define(['N/ui/serverWidget'], function (serverWidget) {

  function render(params) {
    var portlet = params.portlet;

    portlet.title = 'Top Customers Table';

    // Add Inline HTML field to hold the table
    var htmlField = portlet.addField({
      id: 'custpage_inline_table',
      type: serverWidget.FieldType.INLINEHTML,
      label: 'HTML Table'
    });

    // Build the HTML table (you can replace this with dynamic data)
    var html = '<style>' +
               'table { width: 100%; border-collapse: collapse; }' +
               'th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }' +
               'th { background-color: #f2f2f2; }' +
               '</style>';

    html += '<table>';
    html += '<tr><th>Customer</th><th>Total Sales</th></tr>';
    html += '<tr><td>Acme Corp</td><td>$120,000</td></tr>';
    html += '<tr><td>Global Industries</td><td>$95,000</td></tr>';
    html += '<tr><td>XYZ Ltd.</td><td>$85,500</td></tr>';
    html += '</table>';

    // Set the table HTML as the field value
    htmlField.defaultValue = html;
  }

  return {
    render: render
  };
});
