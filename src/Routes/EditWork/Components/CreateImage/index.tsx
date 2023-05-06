import { type FC, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ModalBackdrop from '../../../../Components/ModalBackdrop';
import { type MyImage } from '../../../../../shared/Constants';
import styles from './CreateImage.module.css';

interface Props {
  callbackClose: () => void;
  callbackAddImage: (img: MyImage) => void;
}

const CreateImage: FC<Props> = ({ callbackClose, callbackAddImage }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const refFileUpload = useRef<HTMLInputElement | null>(null);

  const uploadImage = () => {
    if (!imgFile) {
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      fetch(
        `${import.meta.env.VITE_UPLOAD_URL}?Type=${imgFile.type}&Bucket=${import.meta.env.VITE_BUCKET_NAME}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
          body: reader.result,
        },
      )
        .then(resp => resp.json())
        .then(data => {
          const url = `${import.meta.env.VITE_S3_BASE}${data.FileName}`;
          const img = new Image();
          img.src = url;
          img.onload = function() {
            fetch(
              '/api/images',
              {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: JSON.stringify({
                  Title: title,
                  Description: description,
                  Tags: tags,
                  URL: url,
                  Width: img.width,
                  Height: img.height,
                }),
              }
            )
              .then(resp => resp.json())
              .then(data => callbackAddImage({
                Title: title,
                Description: description,
                Tags: tags,
                URL: url,
                Id: data.Id,
                Priority: data.Prio,
              }))
              .catch(console.error);
          };
        })
        .catch(console.error);
      });

    reader.readAsDataURL(imgFile);
  };

  return (
    <ModalBackdrop callbackClose={callbackClose}>
      <motion.div
        onClick={e => e.stopPropagation()}
        className={styles['modal-wrapper']}
      >
        <div className={styles['container-modal-content']}>
          <form>
            <div className={styles['container-form-group']}>
              <label>Title</label>
              <input
                type='text'
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className={styles['container-form-group']}>
              <label>Description</label>
              <input
                type='text'
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className={styles['container-form-group']}>
              <label>Tags</label>
              <input
                type='text'
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>

            <div className='container-image-upload'>
              <input
                style={{display: 'none'}}
                ref={refFileUpload}
                type='file'
                accept='image/*'
                onChange={e => setImgFile(e.target.files && e.target.files[0])}
              />
              <button
                onClick={e => {
                  e.preventDefault();
                  refFileUpload.current?.click();
                }}
                style={{marginBottom: '0.5rem'}}
              >
                Select Image - Dont forget to compress first! (https://compressor.io/)
              </button>
              {imgFile &&
                <b>{imgFile.name}</b>
              }
            </div>

            {uploading
              ? <b>Uploading... This may take a while</b>
              : <button
                  onClick={e => {
                    e.preventDefault();
                    uploadImage();
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
};

export default CreateImage;
