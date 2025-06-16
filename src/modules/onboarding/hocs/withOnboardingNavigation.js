import React, { Suspense } from 'react'
import Navigation, { PageContent } from '@eig-builder/module-navigation'
import { Loader } from '@eig-builder/compositions-loader-with-timeout'

const withOnboardingNavigation = Comp => {
  const LazyComp = React.lazy(Comp)

  class WithOnboardingNavigation extends React.Component {
    render () {
      return (
        <Navigation>
          <PageContent>
            <Suspense fallback={<Loader centeredX centeredY timeOutMs={1500} />}>
              <LazyComp {...this.props} />
            </Suspense>
          </PageContent>
        </Navigation>
      )
    }
  }

  return WithOnboardingNavigation
}

export default withOnboardingNavigation
