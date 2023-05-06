import { useState, useEffect, Fragment, useRef } from 'react';
import { Reorder } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CreateImage from '../../Components/CreateImage/CreateImage.jsx';
import UpdateSpaces from '../../Components/UpdateSpaces/UpdateSpaces.jsx';
import ImageItem from '../../Components/ImageItem/ImageItem.jsx';
import './EditWork.css';

export default function EditWork() {
  const [arrImages, setImages] = useState([]);
  const [intSpaces, setSpaces] = useState(0);
  const [bCreatingImage, setCreatingImage] = useState(false);
  const [bUpdatingSpaces, setUpdatingSpaces] = useState(false);
  const objUniqueImages = useRef({});
  const initLoad = useRef(true);

  useEffect(() => {
    axios({
      url: '/api/images?page=0',
      method: 'GET',
    })
      .then(({data}) => {
        const arrToAdd = [];
        for (const objImg of data) {
          if (objImg.Id in objUniqueImages.current) {
            continue;
          }

          objUniqueImages.current[objImg.Id] = true;
          arrToAdd.push(objImg);
        }

        setImages(prev => (
          [...prev, ...arrToAdd].map(
            (objImg, i) => ({
              ...objImg,
              PriorityOther: Math.ceil((i + 1) / 5),
            }),
          )
        ));
      })
      .catch(console.dir);

    axios({
      url: '/api/spaces',
      method: 'GET',
    })
      .then(({data}) => setSpaces(data.Spaces))
      .catch(console.dir);
  }, []);

  useEffect(() => {
    if (initLoad.current) {
      console.log('init load');
      initLoad.current = false;
      return;
    }

    console.log('images array changed');

    const arrImagesToUpdate = [];
    for (let i = 0; i < arrImages.length; i++) {
      const objImage = arrImages[i];
      const intNewPrioMob = i + 1;
      const intNewPrio = Math.ceil(intNewPrioMob / 5);
      if (intNewPrio !== objImage.PriorityOther) {
        console.log('prio other has changed');
        objImage.PriorityOther = intNewPrio;
      }
      if (intNewPrioMob !== objImage.Priority) {
        console.log('prio has changed');
        objImage.Priority = intNewPrioMob;
        arrImagesToUpdate.push(objImage);
      }
    }

    if (arrImagesToUpdate.length) {
      arrImagesToUpdate.forEach(objImage => axios({
        url: `/api/images/${objImage.Id}`,
        method: 'PUT',
        data: {
          Prio: objImage.Priority,
        },
      }));
      setImages([...arrImages]);
    }
  }, [arrImages]);

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
              <th className='text-row'>Title</th>
              <th className='text-row'>Description</th>
              <th>URL</th>
              <th className='text-row'>Tags</th>
              <th className='btns-row'>Actions</th>
            </tr>
          </thead>
          <Reorder.Group axis='y' onReorder={setImages} values={arrImages} as='tbody'>
            {arrImages.map(objImage => (
              <Fragment key={objImage.Id}>
                <ImageItem
                  item={objImage}
                  callbackUpdate={objNewImage => {
                    axios({
                      url: `/api/images/${objNewImage.Id}`,
                      method: 'PUT',
                      data: {
                        Title: objNewImage.Title,
                        Description: objNewImage.Description,
                        Tags: objNewImage.Tags,
                      },
                    }).catch(console.dir);

                    setImages(prev => prev.map(
                      objExistingImage => objExistingImage.Id === objNewImage.Id
                        ? objNewImage
                        : objExistingImage
                    ));
                  }}
                  callbackDelete={intId => {
                    axios({
                      url: `/api/images/${intId}`,
                      method: 'DELETE',
                    }).catch(console.dir);

                    setImages(prev => prev.filter(o => o.Id !== intId));
                  }}
                />
              </Fragment>
            ))}
          </Reorder.Group>
        </table>
      </div>
      {bCreatingImage &&
        <CreateImage
          callbackClose={() => setCreatingImage(false)}
          callbackAddImage={objNewImage => {
            setImages(prev => [...prev, objNewImage]);
            setCreatingImage(false);
          }}
        />
      }
      {bUpdatingSpaces &&
        <UpdateSpaces
          callbackClose={() => setUpdatingSpaces(false)}
          callbackUpdateSpaces={intNewSpaces => {
            setSpaces(intNewSpaces);
            setUpdatingSpaces(false);
          }}
          intStartingSpaces={intSpaces}
        />
      }
    </div>
  );
}
