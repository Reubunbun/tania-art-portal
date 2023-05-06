import { type FC, useState, useEffect, Fragment, useRef } from 'react';
import { Reorder } from 'framer-motion';
import { Link } from 'react-router-dom';
import CreateImage from './Components/CreateImage';
import UpdateSpaces from './Components/UpdateSpaces';
import ImageItem from './Components/ImageItem';
import { type MyImage } from '../../../shared/Constants';
import styles from './EditWork.module.css';

const EditWork: FC = () => {
  const [images, setImages] = useState<Array<MyImage>>([]);
  const [spaces, setSpaces] = useState<number>(0);
  const [creatingImage, setCreatingImage] = useState<boolean>(false);
  const [updatingSpaces, setUpdatingSpaces] = useState<boolean>(false);
  const uniqueImages = useRef<Record<number, boolean>>({});
  const initLoad = useRef<boolean>(false);

  useEffect(() => {
    fetch('/api/images?page=0', { headers: { Accept: 'application/json' } })
      .then(resp => resp.json() as Promise<Array<MyImage>>)
      .then(data  => {
        const toAdd: Array<MyImage> = [];
        for (const img of data) {
          if (img.Id in uniqueImages) {
            continue;
          }

          uniqueImages.current[img.Id] = true;
          toAdd.push(img);
        }

        setImages(prev => (
          [...prev, ...toAdd].map((img, i) => ({
            ...img,
            PriorityOther: Math.ceil((i + 1) / 5),
          }))
        ));
      })
      .catch(console.error);

    fetch('/api/spaces', { headers: { Accept: 'application/json' } })
      .then(resp => resp.json())
      .then(data => setSpaces(data.Spaces))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (initLoad.current) {
      initLoad.current = false;
      return;
    }

    const imagesToUpdate: Array<MyImage> = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const newPrioMob = i + 1;
      const newPrio = Math.ceil(newPrioMob / 5);
      if (newPrio !== image.PriorityOther) {
        image.PriorityOther = newPrio;
      }
      if (newPrioMob !== image.Priority) {
        image.Priority = newPrioMob;
        imagesToUpdate.push(image);
      }
    }

    if (imagesToUpdate.length) {
      for (const image of imagesToUpdate) {
        fetch(
          `/api/images/${image.Id}`,
          {
            method: 'PUT',
            headers: { Accept: 'application/json' },
            body: JSON.stringify({ Prio: image.Priority }),
          },
        );
      }
      setImages([...images]);
    }
  }, [images]);

  return (
    <div className='page-container'>
      <h1>Make Changes To Tania Art Site</h1>
      <Link to='/editcommissionoptions'>Go To Commission Options</Link>
      <div>
        <button
          className='btn-modal'
          onClick={() => setCreatingImage(true)}
        >
          Upload New Image
        </button>
        <button
          className='btn-modal'
          onClick={() => setUpdatingSpaces(true)}
        >
          Edit Commission Spaces
        </button>
      </div>
      <div className='container-image-list'>
        <table>
          <thead>
            <tr>
              <th>Priority Mobile</th>
              <th>Priority Other</th>
              <th className={styles['text-row']}>Title</th>
              <th className={styles['text-row']}>Description</th>
              <th>URL</th>
              <th className={styles['text-row']}>Tags</th>
              <th className={styles['btns-row']}>Actions</th>
            </tr>
          </thead>
          <Reorder.Group axis='y' onReorder={setImages} values={images} as='tbody'>
            {images.map(image => (
              <Fragment key={image.Id}>
                <ImageItem
                  image={image}
                  callbackUpdate={newImage => {
                    fetch(
                      `/api/images/${newImage.Id}`,
                      {
                        method: 'PUT',
                        headers: { Accept: 'application/json' },
                        body: JSON.stringify({
                          Title: newImage.Title,
                          Description: newImage.Description,
                          Tags: newImage.Tags,
                        }),
                      }
                    ).catch(console.dir);

                    setImages(prev => prev.map(
                      objExistingImage => objExistingImage.Id === newImage.Id
                        ? newImage
                        : objExistingImage
                    ));
                  }}
                  callbackDelete={intId => {
                    fetch(
                      `/api/images/${intId}`,
                      { method: 'DELETE' },
                    ).catch(console.dir);

                    setImages(prev => prev.filter(o => o.Id !== intId));
                  }}
                />
              </Fragment>
            ))}
          </Reorder.Group>
        </table>
      </div>
      {creatingImage &&
        <CreateImage
          callbackClose={() => setCreatingImage(false)}
          callbackAddImage={objNewImage => {
            setImages(prev => [...prev, objNewImage]);
            setCreatingImage(false);
          }}
        />
      }
      {updatingSpaces &&
        <UpdateSpaces
          callbackClose={() => setUpdatingSpaces(false)}
          callbackUpdateSpaces={(newSpaces) => {
            setSpaces(newSpaces);
            setUpdatingSpaces(false);
          }}
          startingSpaces={spaces}
        />
      }
    </div>
  );
};

export default EditWork;
