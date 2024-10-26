import { Types } from 'mongoose';

const { ObjectId } = Types;

export const recursiveUpdate = (
  obj: any,
  nestedObjectId: string,
  updateData: any,
  visited = new Set<any>()
): any => {
  // Prevent circular references
  if (visited.has(obj)) {
    return null;
  }
  visited.add(obj);

  if (!obj || typeof obj !== 'object') {
    return null; 
  }

  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      // Traverse arrays
      for (let i = 0; i < obj[key].length; i++) {
        const item = obj[key][i];

        // Ensure item._id and nestedObjectId are valid ObjectId strings
        if (item && item._id && ObjectId.isValid(item._id) && ObjectId.isValid(nestedObjectId)) {
          if (new ObjectId(item._id).equals(new ObjectId(nestedObjectId))) {
            // Update properties
            Object.assign(item, updateData);
            return { updatedItem: item, parentKey: key, index: i };  
          }
        }
        const updatedNestedItem = recursiveUpdate(item, nestedObjectId, updateData, visited);
        if (updatedNestedItem) return updatedNestedItem; // If found, return it
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (obj[key]._id && ObjectId.isValid(obj[key]._id) && ObjectId.isValid(nestedObjectId)) {
        if (new ObjectId(obj[key]._id).equals(new ObjectId(nestedObjectId))) {
          Object.assign(obj[key], updateData);
          return { updatedItem: obj[key], parentKey: key, index: null };  // Return updated object
        }
      }
      const updatedNestedItem = recursiveUpdate(obj[key], nestedObjectId, updateData, visited);
      if (updatedNestedItem) return updatedNestedItem; // If found, return it
    }
  }
  return null;  // Return null if no match is found
};


