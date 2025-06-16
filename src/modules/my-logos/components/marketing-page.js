import React from 'react'
import { styled } from '@mui/material/styles'
import  { useTheme } from '@mui/material/styles'
import Text from '@eig-builder/module-localization'
import HeroMarketingImage from '../assets/hero-marketing-image.svg'
import '../lang'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import ListOfSalesPoints from '@eig-builder/compositions-list-of-sales-point'

import { Container, Content } from '@eig-builder/compositions-hero-with-backdrop'
import { useApplicationContext } from 'modules/application-config'

const getLocalizationArray = (key, size) => [...new Array(size).keys()].map(index => `${key}_${index}`)

const ContentContainer = styled('div')`
  display: flex;
  flex-direction: column;
`

const VerticalAligned = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
`

const ImgWrapper = styled('div')`
  @media (max-width: 768px) {
    display: none;
  }
`

const LogoMarketingPage = () => {
  const theme = useTheme()

  const { goToCreateLogo, shouldDisable } = useApplicationContext()

  return (
    <>
      <Container>
        <Content>
          <div className='p-3 row'>
            <VerticalAligned className='col'>
              <div>
                <Typography variant='h1' gutterBottom>
                  <Text style={{ lineHeight: 1.5 }} message='logoBuilder.marketing.title' />
                </Typography>
                <Typography variant='subtitle1' gutterBottom>
                  {getLocalizationArray('logoBuilder.marketing.description', 2).map((message, index) => (
                    <Text key={message} message={message} className={`d-block pb-3 ${index === 0 ? 'pt-2' : ''}`} />
                  ))}
                </Typography>
                <ContentContainer>
                  <div className='pb-4 pt-3'>
                    <Button variant='contained' onClick={() => goToCreateLogo()} className='d-inline-block' disabled={shouldDisable}>
                      <Text message='logoBuilder.marketing.primaryButtonTitle' />
                    </Button>
                  </div>
                  <Typography variant='h3' align='left' className='pb-3'>
                    <Text message='logoBuilder.marketing.salesPoints.title' />
                  </Typography>
                  <ListOfSalesPoints
                    color={theme.palette.primary.light}
                    salesPoints={getLocalizationArray('logoBuilder.marketing.salesPoints.point', 3).map(message => (
                      <Text key={message} message={message} />
                    ))}
                  />
                </ContentContainer>
              </div>
            </VerticalAligned>

            <ImgWrapper className='col'>
              <img
                src={HeroMarketingImage}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'left',
                  width: 'calc(100% + 32px)',
                  height: 'calc(100% + 64px)',
                  marginTop: '-32px'
                }}
              />
            </ImgWrapper>
          </div>
        </Content>
      </Container>
    </>
  )
}

export default LogoMarketingPage
