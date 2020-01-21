import React from 'react'

import SiteSearchAPIConnector from '@elastic/search-ui-site-search-connector'
import {
  ErrorBoundary,
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  Paging,
  WithSearch
} from '@elastic/react-search-ui'

import { Layout } from '@elastic/react-search-ui-views'
import '@elastic/react-search-ui-views/lib/styles/styles.css'
import 'app/search.css'

const connector = new SiteSearchAPIConnector({
  documentType: 'page',
  engineKey: 'e4e3Eb9y73dFjykKY8uJ',
  engineName: 'platform9-docs'
})

const config = {
  alwaysSearchOnInitialLoad: false,
  initialState: {
    resultsPerPage: 5
  },
  searchQuery: {
    result_fields: {
      title: { snippet: { size: 100, fallback: true } },
      body: { snippet: { size: 100, fallback: true } },
      url: { raw: {} }
    }
  },
  apiConnector: connector
}

const Article = ({ result: article }) => {
  console.log(article)
  return (
    <div className="st-ui-injected-content st-search-results">
      <div className="st-query-present">
        <a href={article.url.raw} className="st-ui-result">
          <span className="st-ui-type-heading">
            {
              <div
                dangerouslySetInnerHTML={{ __html: article.title.snippet }}
              />
            }
          </span>
          <span className="st-ui-type-detail">
            <div dangerouslySetInnerHTML={{ __html: article.body.snippet }} />
          </span>
        </a>
      </div>
    </div>
  )
}

const HelpPage = () => {
  return (
    <>
      <section className={'hero'}>
        <div className={'hero-welcome'}>
          <h1>Platform9 Help Center</h1>
          <h2>You are currently using Platform9 Managed Kubernetes (PMK) <b>free-tier</b>.</h2>
          <h3>Support for free-tier is limited to our knowledge base and community support via our
            Slack channel.</h3>

          <SearchProvider config={config}>
            <WithSearch mapContextToProps={({ wasSearched }) => ({ wasSearched })}>
              {({ wasSearched }) => {
                return (
                  <div className="App">
                    <ErrorBoundary>
                      <Layout
                        header={
                          <SearchBox
                            autocompleteMinimumCharacters={3}
                            autocompleteResults={{
                              linkTarget: '_blank',
                              sectionTitle: 'Results',
                              titleField: 'title',
                              urlField: 'nps_link',
                              shouldTrackClickThrough: true
                            }}
                            autocompleteSuggestions
                            debounceLength={0}
                          />
                        }
                        bodyContent={
                          <Results titleField="title" resultView={Article} />
                        }
                        bodyHeader={
                          <React.Fragment>
                            {wasSearched && <PagingInfo />}
                          </React.Fragment>
                        }
                        bodyFooter={<Paging />}
                      />
                    </ErrorBoundary>
                  </div>
                )
              }}
            </WithSearch>
          </SearchProvider>
        </div>
      </section>
    </>
  )
}

export default HelpPage
