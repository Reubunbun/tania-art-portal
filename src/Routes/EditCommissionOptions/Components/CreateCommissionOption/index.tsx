import { type FC, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ModalBackdrop from '../../../../Components/ModalBackdrop';
import { type CommissionOption } from '../../../../../shared/Constants';

interface Props {
  callbackClose: () => void;
  type: string;
  callbackAddOption: (option: CommissionOption) => void;
}

const CreateCommissionOption: FC<Props> = ({ callbackClose, type, callbackAddOption }) => {
  const [display, setDisplay] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [offer, setOffer] = useState<string>('');
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const refFileUpload = useRef<HTMLInputElement | null>(null);

  const fnUploadImage = () => {
    const priceAsNum = +price;
    const offerAsNum = +offer;

    if (
      !display ||
      !imgFile ||
      !price ||
      Number.isNaN(priceAsNum) ||
      Number.isNaN(offerAsNum) ||
      priceAsNum < 0 ||
      offerAsNum < 0 ||
      offerAsNum > 100
    ) {
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
            Accept: 'application/json'
          },
          body: reader.result,
        }
      )
        .then(resp => resp.json())
        .then(data => {
          const strUrl = `${import.meta.env.VITE_S3_BASE}${data.FileName}`;
          const img = new Image();
          img.src = strUrl;
          img.onload = function() {
            fetch(
              `/api/commission-options?type=${type}`,
              {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: JSON.stringify({
                  Display: display,
                  Price: price,
                  Offer: offer,
                  ExampleURL: strUrl,
                }),
              }
            )
              .then(() => callbackAddOption({
                Display: display,
                Price: price,
                Offer: offer,
                ExampleURL: strUrl
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
        className='modal-wrapper'
      >
        <div className='container-modal-content'>
          <form>
            <div className='container-form-group'>
              <label>Display</label>
              <input
                type='text'
                value={display}
                onChange={e => setDisplay(e.target.value)}
              />
            </div>

            <div className='container-form-group'>
              <label>Price</label>
              <input
                type='text'
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>

            <div className='container-form-group'>
              <label>Offer</label>
              <input
                type='text'
                placeholder='Leave blank for no offer'
                value={offer}
                onChange={e => setOffer(e.target.value)}
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
              >
                Upload Example Image - Dont forget to compress first! (https://compressor.io/)
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
};

export default CreateCommissionOption;
