// export const repositoriesSelector = createSelector(
//   [
//     getDataSelector<DataKeys.Repositories>(DataKeys.Repositories),
//     getDataSelector(DataKeys.RepositoriesWithClusters),
//   ],
//   (rawRepos, reposWithClusters) => {
//     return map(({ id, type, attributes }) => ({
//       id,
//       type,
//       name: attributes.name,
//       url: attributes.URL,
//       source: attributes.source,
//       clusters: pipe(
//         find(propEq(uniqueIdentifier, id)),
//         propOr(emptyArr, 'clusters'),
//       )(reposWithClusters),
//     }))(rawRepos)
//   },
// )
