import { type FC, useState } from 'react';
import { type CommissionOption } from '../../../../../shared/Constants';

interface Props {
  item: CommissionOption;
  callbackUpdate: (option: CommissionOption) => void;
  callbackDelete: (optionDisplay: string) => void;
}

const CommissionItem: FC<Props> = ({ item, callbackUpdate, callbackDelete }) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [display, setDisplay] = useState<string>(item.Display);
  const [price, setPrice] = useState<string>(item.Price);
  const [offer, setOffer] = useState<string>(item.Offer);

  const rejectChanges = () => {
    setDisplay(item.Display);
    setPrice(item.Price);
    setOffer(item.Offer);
    setEditMode(false);
  };

  const acceptChanges = () => {
    const newOption = {...item};

    const priceAsNum = +price;
    const offerAsNum = +offer;
    if (
      !display ||
      !price ||
      Number.isNaN(priceAsNum) ||
      Number.isNaN(offerAsNum) ||
      priceAsNum < 0 ||
      offerAsNum < 0 ||
      offerAsNum > 100
    ) {
      return;
    }

    let bFoundChange = false;
    if (item.Display !== display) {
      newOption.Display = display;
      bFoundChange = true;
    }

    if (item.Price !== price) {
      newOption.Price = `${priceAsNum}`;
      bFoundChange = true;
    }

    if (item.Offer !== offer) {
      newOption.Offer = `${offerAsNum}`;
      bFoundChange = true;
    }

    if (bFoundChange) {
      callbackUpdate(newOption);
    }

    setEditMode(false);
  };

  return (
    <tr>
      <td>
        {editMode
          ? <input
              type='text'
              value={display}
              onChange={e => setDisplay(e.target.value)}
            />
          : <>{item.Display}</>
        }
      </td>
      <td>
        {editMode
          ? <input
              type='text'
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          : <>{item.Price}</>
        }
      </td>
      <td>
        {editMode
          ? <input
              type='text'
              value={offer}
              onChange={e => setOffer(e.target.value)}
            />
          : <>{item.Offer}</>
        }
      </td>
      <td>
        <a
          href={item.ExampleURL}
          target='_blank'
          rel='noreferrer'
        >
          Example URL
        </a>
      </td>
      <td>
        {editMode
          ? <>
              <button onClick={rejectChanges}>Cancel</button>
              <button onClick={acceptChanges}>Save</button>
              <button onClick={() => callbackDelete(item.Display)}>Delete</button>
            </>
          : <button onClick={() => setEditMode(true)}>Edit</button>
        }
      </td>
    </tr>
  );
};

export default CommissionItem;
