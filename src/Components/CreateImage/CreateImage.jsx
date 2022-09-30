import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ModalBackdrop from '../ModalBackdrop/ModalBackdrop.jsx';
import './CreateImage.css';

export default function CreateImage({
  callbackClose,
  callbackAddImage,
}) {
  const [strTitle, setTitle] = useState('');
  const [strDescription, setDescription] = useState('');
  const [strTags, setTags] = useState('');
  const [objImgFile, setImgFile] = useState(null);
  const [bUploading, setUploading] = useState(false);
  const refFileUpload = useRef();

  const fnUploadImage = () => {
    setUploading(true);
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      axios({
        url: `${process.env.REACT_APP_UPLOAD_URL}?Type=${objImgFile.type}&Bucket=tania-portfolio`,
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: reader.result,
      })
        .then(({data}) => {
          const strUrl = `https://tania-portfolio.s3.eu-west-1.amazonaws.com/${data.FileName}`;
          const img = new Image();
          img.src = strUrl;
          img.onload = function() {
            axios({
              url: '/api/images',
              method: 'POST',
              data: {
                Title: strTitle,
                Description: strDescription,
                Tags: strTags,
                URL: strUrl,
                Width: this.width,
                Height: this.height,
              },
            })
              .then(({data}) => callbackAddImage({
                Title: strTitle,
                Tags: strTags,
                Description: strDescription,
                URL: strUrl,
                Id: data.Id,
                Priority: data.Prio,
              }))
              .catch(console.dir);
          };
        })
        .catch(console.dir);
    });
    reader.readAsDataURL(objImgFile);
  };

  return (
    <ModalBackdrop callbackClose={callbackClose}>
      <motion.div
        onClick={e => e.stopPropagation()}
        className='modal-wrapper'
      >
        <div className='container-modal-content'>
          <form>
            <div className='container-form-group'>
              <label>Title</label>
              <input
                type='text'
                value={strTitle}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className='container-form-group'>
              <label>Description</label>
              <input
                type='text'
                value={strDescription}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className='container-form-group'>
              <label>Tags</label>
              <input
                type='text'
                value={strTags}
                onChange={e => setTags(e.target.value)}
              />
            </div>

            <div className='container-image-upload'>
              <input
                style={{display: 'none'}}
                ref={refFileUpload}
                type='file'
                accept='image/*'
                onChange={e => setImgFile(e.target.files[0])}
              />
              <button
                onClick={e => {
                    e.preventDefault();
                    refFileUpload.current?.click();
                }}
              >
                Upload Image - Dont forget to compress first! (https://compressor.io/)
              </button>
              {objImgFile &&
                <b>{objImgFile.name}</b>
              }
            </div>

            {bUploading
              ? <b>Uploading... This may take a while</b>
              : <button
                  onClick={e => {
                    e.preventDefault();
                    fnUploadImage();
                  }}
                >
                  Upload
                </button>
            }
          </form>
        </div>
      </motion.div>
    </ModalBackdrop>
  );
}
