import OpnHero from 'images/opn-hero.svg'
import OpnSection1 from 'images/opn-section-1.png'
import OpnSection2 from 'images/opn-section-2.svg'
import OpnFooter from 'images/opn-footer.png'
import OpnFooter1 from 'images/opn-footer-1.png'
import OpnFooter2 from 'images/opn-footer-2.png'
import OpnFooter3 from 'images/opn-footer-3.png'

export default unlock => ({
  heroSection: {
    title: 'logoMaker.opnUpsell.heroSection.title',
    description: 'logoMaker.opnUpsell.heroSection.description',
    buttonText: `logoMaker.opnUpsell.heroSection.${unlock ? 'buttonTextUnlock' : 'buttonText'}`,
    image: OpnHero
  },
  contentSection: {
    blockOne: {
      image: OpnSection1
    },
    blockTwo: {
      title: 'logoMaker.opnUpsell.contentSection.blockTwo.title',
      description: 'logoMaker.opnUpsell.contentSection.blockTwo.description'
    },
    blockThree: {
      title: 'logoMaker.opnUpsell.contentSection.blockThree.title',
      lists: [
        {
          description: 'logoMaker.opnUpsell.contentSection.blockThree.description1',
          items: [
            'logoMaker.opnUpsell.contentSection.blockThree.items1.item1',
            'logoMaker.opnUpsell.contentSection.blockThree.items1.item2',
            'logoMaker.opnUpsell.contentSection.blockThree.items1.item3',
            'logoMaker.opnUpsell.contentSection.blockThree.items1.item4'
          ]
        },
        {
          description: 'logoMaker.opnUpsell.contentSection.blockThree.description2',
          items: [
            'logoMaker.opnUpsell.contentSection.blockThree.items2.item1',
            'logoMaker.opnUpsell.contentSection.blockThree.items2.item2',
            'logoMaker.opnUpsell.contentSection.blockThree.items2.item3',
            'logoMaker.opnUpsell.contentSection.blockThree.items2.item4'
          ]
        }
      ]
    },
    blockFour: {
      image: OpnSection2
    }
  },
  footerSection: {
    header: {
      title: 'logoMaker.opnUpsell.footerSection.header.title',
      description: 'logoMaker.opnUpsell.footerSection.header.description',
      image: OpnFooter
    },
    cards: [
      {
        title: 'logoMaker.opnUpsell.footerSection.cards.card1.title',
        description: 'logoMaker.opnUpsell.footerSection.cards.card1.description',
        image: OpnFooter1
      },
      {
        title: 'logoMaker.opnUpsell.footerSection.cards.card2.title',
        description: 'logoMaker.opnUpsell.footerSection.cards.card2.description',
        image: OpnFooter2
      },
      {
        title: 'logoMaker.opnUpsell.footerSection.cards.card3.title',
        description: 'logoMaker.opnUpsell.footerSection.cards.card3.description',
        image: OpnFooter3
      }
    ]
  }
})
