import { type FC, useState, Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CreateCommissionOption from './Components/CreateCommissionOption';
import CommissionItem from './Components/CommissionItem';
import { type CommissionOption, COMM_TYPE_BASE, COMM_TYPE_BG } from '../../../shared/Constants';
import styles from './EditCommissionOptions.module.css';

const EditCommissionOptions: FC = () => {
  const [baseOptions, setBaseOptions] = useState<Array<CommissionOption>>([]);
  const [backgroundOptions, setBackgroundOptions] = useState<Array<CommissionOption>>([]);
  const [addingBase, setAddingBase] = useState<boolean>(false);
  const [addingBackground, setAddingBackground] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/api/commission-options?type=${COMM_TYPE_BASE}`, { headers: { Accept: 'application/json' } })
      .then(resp => resp.json())
      .then(setBaseOptions)
      .catch(console.error);

    fetch(`/api/commission-options?type=${COMM_TYPE_BG}`, { headers: { Accept: 'application/json' } })
      .then(resp => resp.json())
      .then(setBackgroundOptions)
      .catch(console.error);
  }, []);

  return (
    <div className='page-container'>
      <h1>Make Changes To Commission Options</h1>
      <Link to='/editwork'>Go To Gallery Options</Link>
      <div>
        <button
          className='btn-modal'
          onClick={() => setAddingBase(true)}
        >
          Add New Base Option
        </button>
        <button
          className='btn-modal'
          onClick={() => setAddingBackground(true)}
        >
          Add New Background Option
        </button>
      </div>
      <div className={styles['container-tables']}>
        <div>
          <h2>Base Options</h2>
          <table>
            <thead>
              <tr>
                <th>Display</th>
                <th>Price</th>
                <th>Offer (% off)</th>
                <th>Example Image</th>
              </tr>
            </thead>
            <tbody>
              {baseOptions.map(baseOption =>
                <Fragment key={baseOption.Display}>
                  <CommissionItem
                    item={baseOption}
                    callbackUpdate={objNewOption => {
                      fetch(
                        `/api/commission-options/${baseOption.Display}?type=${COMM_TYPE_BASE}`,
                        {
                          method: 'PUT',
                          headers: { Accept: 'application/json' },
                          body: JSON.stringify({
                            Display: objNewOption.Display,
                            Price: objNewOption.Price,
                            Offer: objNewOption.Offer || null,
                          }),
                        }
                      ).catch(console.error);

                      setBaseOptions(prev => prev.map(
                        objExistingType => objExistingType.Display === baseOption.Display
                          ? objNewOption
                          : objExistingType,
                      ));
                    }}
                    callbackDelete={display => {
                      fetch(
                        `/api/commission-options/${display}?type=${COMM_TYPE_BASE}`,
                        { method: 'DELETE' },
                      ).catch(console.error);

                      setBaseOptions(prev => prev.filter(o => o.Display !== display));
                    }}
                  />
                </Fragment>
              )}
            </tbody>
          </table>
        </div>
        <div>
          <h2>Background Options</h2>
          <table>
            <thead>
              <tr>
              <th>Display</th>
              <th>Price</th>
              <th>Offer (% off)</th>
              <th>Example Image</th>
              </tr>
            </thead>
            <tbody>
              {backgroundOptions.map(backgroundOption =>
                <Fragment key={backgroundOption.Display}>
                  <CommissionItem
                    item={backgroundOption}
                    callbackUpdate={objNewOption => {
                      fetch(
                        `/api/commission-options/${backgroundOption.Display}?type=${COMM_TYPE_BG}`,
                        {
                          method: 'PUT',
                          headers: { Accept: 'application/json' },
                          body: JSON.stringify({
                            Display: objNewOption.Display,
                            Price: objNewOption.Price,
                            Offer: objNewOption.Offer || null,
                          }),
                        }
                      ).catch(console.error);

                      setBackgroundOptions(prev => prev.map(
                        objExistingType => objExistingType.Display === backgroundOption.Display
                          ? objNewOption
                          : objExistingType,
                      ));
                    }}
                    callbackDelete={display => {
                      fetch(
                        `/api/commission-options/${display}?type=${COMM_TYPE_BG}`,
                        { method: 'DELETE' },
                      ).catch(console.error);

                      setBackgroundOptions(prev => prev.filter(o => o.Display !== display));
                    }}
                  />
                </Fragment>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {addingBase &&
        <CreateCommissionOption
          callbackClose={() => setAddingBase(false)}
          type={COMM_TYPE_BASE}
          callbackAddOption={newOption => {
            setBaseOptions(prev => [...prev, newOption]);
            setAddingBase(false);
          }}
        />
      }
      {addingBackground &&
        <CreateCommissionOption
          callbackClose={() => setAddingBackground(false)}
          type={COMM_TYPE_BG}
          callbackAddOption={objNewOption => {
            setBackgroundOptions(prev => [...prev, objNewOption]);
            setAddingBackground(false);
          }}
        />
      }
    </div>
  );
};

export default EditCommissionOptions;
