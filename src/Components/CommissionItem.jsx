import { useState } from 'react';

export default function CommissionItem({ item, callbackUpdate, callbackDelete }) {
  const [bEditMode, setEditMode] = useState(false);
  const [strDisplay, setDisplay] = useState(item.display);
  const [strPrice, setPrice] = useState(item.price);
  const [strOffer, setOffer] = useState(item.offer);

  const fnRejectChanges = () => {
    setDisplay(item.display);
    setPrice(item.price);
    setOffer(item.offer);
    setEditMode(false);
  };

  const fnAcceptChanges = () => {
    const objNewOption = {...item};

    const intPrice = +strPrice;
    const intOffer = +strOffer;
    if (
      !strDisplay ||
      !strPrice ||
      isNaN(intPrice) ||
      isNaN(intOffer) ||
      intPrice < 0 ||
      intOffer < 0 ||
      intOffer > 100
    ) {
      return;
    }

    let bFoundChange = false;
    if (item.display !== strDisplay) {
      objNewOption.display = strDisplay;
      bFoundChange = true;
    }

    if (item.price !== strPrice) {
      objNewOption.price = intPrice;
      bFoundChange = true;
    }

    if (item.price !== strOffer) {
      objNewOption.offer = intOffer;
      bFoundChange = true;
    }

    if (bFoundChange) {
      callbackUpdate(objNewOption);
    }

    setEditMode(false);
  };

  return (
    <tr>
      <td>
        {bEditMode
          ? <input
              type='text'
              value={strDisplay}
              onChange={e => setDisplay(e.target.value)}
            />
          : <>{item.display}</>
        }
      </td>
      <td>
        {bEditMode
          ? <input
              type='text'
              value={strPrice}
              onChange={e => setPrice(e.target.value)}
            />
          : <>{item.price}</>
        }
      </td>
      <td>
        {bEditMode
          ? <input
              type='text'
              value={strOffer}
              onChange={e => setOffer(e.target.value)}
            />
          : <>{item.offer}</>
        }
      </td>
      <td>
        <a
          href={item.example_url}
          target='_blank'
          rel='noreferrer'
        >
          Example URL
        </a>
      </td>
      <td>
        {bEditMode
          ? <>
              <button onClick={fnRejectChanges}>Cancel</button>
              <button onClick={fnAcceptChanges}>Save</button>
              <button onClick={() => callbackDelete(item.display)}>Delete</button>
            </>
          : <button onClick={() => setEditMode(true)}>Edit</button>
        }
      </td>
    </tr>
  );
};
