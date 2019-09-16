import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/partner-list-card';
import { computed }  from '@ember/object';
import { A }  from '@ember/array';
import { inject as service } from '@ember/service';

/**
* Card displaying a hint of the Date plugin
*
* @module editor-partner-list-plugin
* @class PartnerListCard
* @extends Ember.Component
*/
export default Component.extend({
  layout,
  store: service(),
  partners: A([]),

  availableOrganizations: computed('partners.[]', function(){
    return this.organizations.filter(p => ! this.partners.includes(p)).sortBy('firstname');
  }),

  innerHTML: computed('partners.[]', function(){
    const list = this.partners.map( organization => `
    <div class="item">
      <img property="notable:hasLogo"
        alt="${organization.title}'s logo"
        src="${organization.logo}" />
    </div>
  `);

    return `
      <div class="text-gray-500 italic">
        <i class="edit icon"></i> Edit the list
      </div>
      <div class="row">
        ${list.join('')}
      </div>`;
  }),

  /**
   * Region on which the card applies
   * @property location
   * @type [number,number]
   * @private
  */
  location: reads('info.location'),

  /**
   * Unique identifier of the event in the hints registry
   * @property hrId
   * @type Object
   * @private
  */
  hrId: reads('info.hrId'),

  /**
   * The RDFa editor instance
   * @property editor
   * @type RdfaEditor
   * @private
  */
  editor: reads('info.editor'),

  /**
   * Hints registry storing the cards
   * @property hintsRegistry
   * @type HintsRegistry
   * @private
  */
  hintsRegistry: reads('info.hintsRegistry'),

  async init() {
    this._super(...arguments);
    this.set('organizations', await this.store.findAll('organization'));
  },

  actions: {
    addPartner (partner) {
      this.partners.pushObject(partner);
    },

    commit(){
      const mappedLocation = this.get('hintsRegistry').updateLocationToCurrentIndex(this.get('hrId'), this.get('location'));
      this.get('hintsRegistry').removeHintsAtLocation(mappedLocation, this.get('hrId'), 'editor-plugins/partner-list-card');

      const selection = this.editor.selectContext(mappedLocation, { typeof: this.info.typeof });
      this.editor.update(selection, {
        set: {
          innerHTML: this.innerHTML
        }
      });
      this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.who);
    },

    removePartner (partner) {
      this.partners.removeObject(partner);
    }
  }
});
