import { type FC, useState } from 'react';
import { Reorder } from 'framer-motion';
import { type MyImage } from '../../../../../shared/Constants';

interface Props {
  image: MyImage;
  callbackUpdate: (img: MyImage) => void;
  callbackDelete: (id: number) => void;
}

const ImageItem: FC<Props> = ({ image, callbackUpdate, callbackDelete }) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(image.Title);
  const [description, setDescription] = useState<string>(image.Description);
  const [tags, setTags] = useState<string>(image.Tags);

  const rejectChanges = () => {
    setTitle(image.Title);
    setDescription(image.Description);
    setEditMode(false);
  };

  const acceptChanges = () => {
    const newImg = {...image};

    let foundChange = false;
    if (image.Title !== title) {
      newImg.Title = title;
      foundChange = true;
    }

    if (image.Description !== description) {
      newImg.Description = description;
      foundChange = true;
    }

    if (image.Tags !== tags) {
      const originalTags = image.Tags.split(',').map(tag => tag.trim());
      const newTags = tags.split(',')
        .map(tag => tag.trim())
        .filter(Boolean);

      if (JSON.stringify(originalTags) !== JSON.stringify(newTags)) {
        foundChange = true;
        newImg.Tags = newTags.join(', ');
      }

      setTags(newTags.join(', '));
    }

    if (foundChange) {
      callbackUpdate(newImg);
    }

    setEditMode(false);
  };

  return (
    <Reorder.Item
      value={image}
      id={`${image.Id}`}
      as='tr'
      style={{pointerEvents: editMode ? 'none' : undefined}}
    >
      <td>{image.Priority}</td>
      <td>{image.PriorityOther}</td>
      <td>
        {editMode
          ? <input
              type='text'
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          : <>{image.Title}</>
        }
      </td>
      <td>
        {editMode
          ? <input
              type='text'
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          : <>{image.Description}</>
        }
      </td>
      <td>
        <a href={image.URL} target='_blank' rel='noreferrer'>Link To Image</a>
      </td>
      <td>
        {editMode
          ? <input
              type='text'
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          : <>{image.Tags}</>
        }
      </td>
      <td>
        {editMode
          ? <>
              <button onClick={rejectChanges}>Cancel</button>
              <button onClick={acceptChanges}>Save</button>
              <button onClick={() => callbackDelete(image.Id)}>Delete</button>
            </>
          : <button onClick={() => setEditMode(true)}>Edit</button>
        }
      </td>
    </Reorder.Item>
  );
};

export default ImageItem;
