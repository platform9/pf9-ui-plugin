export const updateClarityStore = (key: string, value: any) => {
  if (localStorage.clarityStore) {
    const store = JSON.parse(localStorage.clarityStore)
    const updatedStore = {
      ...store,
      [key]: value,
    }
    return (localStorage.clarityStore = JSON.stringify(updatedStore))
  }
  return (localStorage.clarityStore = JSON.stringify({
    [key]: value,
  }))
}
