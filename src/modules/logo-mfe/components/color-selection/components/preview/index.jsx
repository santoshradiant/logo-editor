import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import Text from '@eig-builder/module-localization'
import Layout from './preview.views'
import { Button, Typography } from '@mui/material'
import AdvEditor from 'images/adv-editor.svg'
import LogoInstance from 'core/logo-maker/logo-instance'

import amcore from 'core/logo-maker/amcore'
import { generateSymbol, getPaletteConfig } from 'core/logo-maker/utils/logo-generation'

const Preview = ({ template, instanceRef, onClick, isEditorLoading }) => {
  const iconVariantRef = useRef(null)
  const iconVariantRef2 = useRef(null)

  useEffect(() => {
    const instance = new LogoInstance({
      ...template,
      color: {
        ...template.color,
        ...getPaletteConfig(template)
      }
    })
    let intervalId = null
    instanceRef.current.instance = instance
    intervalId && clearInterval(intervalId)

    if (instanceRef.current.ref.current) {
      instanceRef.current.ref.current.innerHTML = ''
      instance.update()
      instanceRef.current.ref.current.appendChild(instance.getPreviewElement())

      intervalId = setInterval(() => {
        const templateRef = {
          ...amcore.clone(instance.templateData),
          color: {
            ...amcore.clone(instance.templateData.color),
            decoration: 0,
            symbol: 3
          }
        }
        const templateRef2 = {
          ...templateRef,
          color: {
            ...templateRef.color,
            decoration: 3,
            symbol: 0
          }
        }

        generateSymbol(instance, [iconVariantRef, iconVariantRef2], [templateRef, templateRef2], intervalId)
      }, 1000)

      return () => {
        clearInterval(intervalId)
      }
    }
  }, [template, instanceRef])

  return (
    <Layout>
      <Layout.TitleContainer height='auto'>
        <Typography variant='h2'>
          <Text message='logoMFE.colorSelection.preview.title' />
        </Typography>
        <Button
          disabled={isEditorLoading}
          startIcon={
            isEditorLoading ? (
              <Layout.LoadingIcon size={20} thickness={5} />
            ) : (
              <img src={AdvEditor} alt='Advanced Editor' />
            )
          }
          variant='contained'
          color=''
          onClick={onClick}
        >
          <Text message={`logoMFE.colorSelection.preview.${isEditorLoading ? 'saving' : 'AdvanceEditor'}`} />
        </Button>
      </Layout.TitleContainer>
      <Layout.Container height='100%'>
        <Layout.Item width='65%'>
          <div className='logo-editor-preview big-card'>
            <Layout.Logo ref={instanceRef.current.ref} />
          </div>
        </Layout.Item>
        <Layout.Item width='35%'>
          <Layout.Container flexDirection='column'>
            <Layout.Item height='50%' top={0} right={0} bottom={4}>
              <div className='logo-editor-preview big-card'>
                <Layout.Logo ref={iconVariantRef} />
              </div>
            </Layout.Item>
            <Layout.Item height='50%' top={4} right={0} bottom={0}>
              <div className='logo-editor-preview big-card'>
                <Layout.Logo ref={iconVariantRef2} />
              </div>
            </Layout.Item>
          </Layout.Container>
        </Layout.Item>
      </Layout.Container>
    </Layout>
  )
}

Preview.propTypes = {
  template: PropTypes.object.isRequired,
  instanceRef: PropTypes.object.isRequired,
  isEditorLoading: PropTypes.bool,
  onClick: PropTypes.func.isRequired
}

export default Preview
