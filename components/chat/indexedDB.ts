const openDB = indexedDB.open("MyAppDatabase", 1);

openDB.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result;
  if (!db.objectStoreNames.contains("images")) {
    const store = db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
    // Optional: Create indexes for faster queries (e.g., by filename or timestamp)
    store.createIndex("name", "name", { unique: false });
  }
};

openDB.onerror = (event) => {
  console.error("IndexedDB error:", (event.target as IDBOpenDBRequest).error);
};

export function saveImageToDB(imageFile: File, imageName: string) {
    const dbRequest = indexedDB.open("MyAppDatabase", 1);
    dbRequest.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("images", "readwrite");
      const store = transaction.objectStore("images");
  
      // Create an entry with metadata
      const imageEntry = {
        name: imageName,
        blob: imageFile, // the image file is stored as a Blob
        timestamp: Date.now()
      };
  
      const addRequest = store.add(imageEntry);
      addRequest.onsuccess = () => {
        console.log("Image saved successfully!");
      };
      addRequest.onerror = () => {
        console.error("Error saving image:", addRequest.error);
      };
    };
  }

  function loadImagesFromDB() {
    const dbRequest = indexedDB.open("MyAppDatabase", 1);
    dbRequest.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("images", "readonly");
      const store = transaction.objectStore("images");
  
      const images: { id: number; name: string; blob: Blob; timestamp: number }[] = [];
      const cursorRequest = store.openCursor();
  
      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          images.push(cursor.value);
          cursor.continue();
        } else {
          // All images retrieved – now create preview URLs
          images.forEach((img) => {
            const previewURL = URL.createObjectURL(img.blob);
            // You can now update your state to include this preview URL along with other data
            console.log(`Image ${img.name} loaded with preview URL:`, previewURL);
          });
        }
      };
    };
  }


export  function deleteImageFromDB(id: number) {
    const dbRequest = indexedDB.open("MyAppDatabase", 1);
    dbRequest.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("images", "readwrite");
      const store = transaction.objectStore("images");
  
      const deleteRequest = store.delete(id);
      deleteRequest.onsuccess = () => {
        console.log("Image deleted successfully!");
      };
      deleteRequest.onerror = () => {
        console.error("Error deleting image:", deleteRequest.error);
      };
    };
  }
