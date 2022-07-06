const { worksUi } = require('@demo/registry-ui/applications');
const { superTool } = require('@demo/super-tools');

module.exports = superTool().nwb.microfrontend({ globalName: worksUi.globalName });
