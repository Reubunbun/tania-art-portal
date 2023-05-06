import { useState } from 'react';
import { Reorder } from 'framer-motion';

export default function ImageItem({item, callbackUpdate, callbackDelete}) {
  const [bEditMode, setEditMode] = useState(false);
  const [strTitle, setTitle] = useState(item.Title);
  const [strDescription, setDescription] = useState(item.Description);
  const [strTags, setTags] = useState(item.Tags);

  const fnRejectChanges = () => {
    setTitle(item.Title);
    setDescription(item.Description);
    setEditMode(false);
  };

  const fnAcceptChanges = () => {
    const objNewImg = {...item};

    let bFoundChange = false;
    if (item.Title !== strTitle) {
      objNewImg.Title = strTitle;
      bFoundChange = true;
    }

    if (item.Description !== strDescription) {
      objNewImg.Description = strDescription;
      bFoundChange = true;
    }

    if (item.Tags !== strTags) {
      const arrOriginalTags = item.Tags.split(',').map(strTag => strTag.trim());
      const arrNewTags = strTags.split(',')
        .map(strTag => strTag.trim())
        .filter(strTag => strTag);

      console.log({arrOriginalTags, arrNewTags});
      if (JSON.stringify(arrOriginalTags) !== JSON.stringify(arrNewTags)) {
        bFoundChange = true;
        objNewImg.Tags = arrNewTags.join(', ');
      }

      setTags(arrNewTags.join(', '));
    }

    if (bFoundChange) {
      callbackUpdate(objNewImg);
    }

    setEditMode(false);
  };

  return (
    <Reorder.Item
      value={item}
      id={item.Id}
      as='tr'
      style={{pointerEvents: bEditMode ? 'none' : undefined}}
    >
      <td>{item.Priority}</td>
      <td>{item.PriorityOther}</td>
      <td>
        {bEditMode
          ? <input
              type='text'
              value={strTitle}
              onChange={e => setTitle(e.target.value)}
            />
          : <>{item.Title}</>
        }
      </td>
      <td>
        {bEditMode
          ? <input
              type='text'
              value={strDescription}
              onChange={e => setDescription(e.target.value)}
            />
          : <>{item.Description}</>
        }
      </td>
      <td>
        <a href={item.URL} target='_blank' rel='noreferrer'>Link To Image</a>
      </td>
      <td>
        {bEditMode
          ? <input
              type='text'
              value={strTags}
              onChange={e => setTags(e.target.value)}
            />
          : <>{item.Tags}</>
        }
      </td>
      <td>
        {bEditMode
          ? <>
              <button onClick={fnRejectChanges}>Cancel</button>
              <button onClick={fnAcceptChanges}>Save</button>
              <button onClick={() => callbackDelete(item.Id)}>Delete</button>
            </>
          : <button onClick={() => setEditMode(true)}>Edit</button>
        }
      </td>
    </Reorder.Item>
  );
}
