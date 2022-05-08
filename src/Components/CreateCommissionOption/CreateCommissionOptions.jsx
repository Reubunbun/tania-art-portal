import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ModalBackdrop from '../ModalBackdrop/ModalBackdrop.jsx';

export default function CreateCommissionOption({
  callbackClose,
  strType,
  callbackAddOption,
}) {
  const [strDisplay, setDisplay] = useState('');
  const [strPrice, setPrice] = useState('');
  const [strOffer, setOffer] = useState('');
  const [objImgFile, setImgFile] = useState(null);
  const [bUploading, setUploading] = useState(false);
  const refFileUpload = useRef();

  const fnUploadImage = () => {
    const intPrice = +strPrice;
    const intOffer = +strOffer;

    if (
      !strDisplay ||
      !objImgFile ||
      !strPrice ||
      isNaN(intPrice) ||
      isNaN(intOffer) ||
      intPrice < 0 ||
      intOffer < 0 ||
      intOffer > 100
    ) {
      return;
    }

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
              url: `/api/commission-options?type=${strType}`,
              method: 'POST',
              data: {
                Display: strDisplay,
                Price: strPrice,
                Offer: strOffer || undefined,
                ExampleURL: strUrl,
              },
            })
              .then(() => callbackAddOption({
                display: strDisplay,
                price: strPrice,
                offer: strOffer,
                example_url: strUrl
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
              <label>Display</label>
              <input
                type='text'
                value={strDisplay}
                onChange={e => setDisplay(e.target.value)}
              />
            </div>

            <div className='container-form-group'>
              <label>Price</label>
              <input
                type='text'
                value={strPrice}
                onChange={e => setPrice(e.target.value)}
              />
            </div>

            <div className='container-form-group'>
              <label>Offer</label>
              <input
                type='text'
                placeholder='Leave blank for no offer'
                value={strOffer}
                onChange={e => setOffer(e.target.value)}
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
                Upload Example Image
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
