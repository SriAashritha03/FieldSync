export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FieldSyncDB', 1)
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains('submissions')) {
        db.createObjectStore('submissions', { keyPath: 'id', autoIncrement: true })
      }
    }
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const saveOffline = async (data) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('submissions', 'readwrite')
    const store = tx.objectStore('submissions')
    store.add({ ...data, synced: false, createdAt: new Date() })
    
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export const getOfflineSubmissions = async () => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('submissions', 'readonly')
    const store = tx.objectStore('submissions')
    const request = store.getAll()
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const deleteOffline = async (id) => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('submissions', 'readwrite')
    const store = tx.objectStore('submissions')
    store.delete(id)
    
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
