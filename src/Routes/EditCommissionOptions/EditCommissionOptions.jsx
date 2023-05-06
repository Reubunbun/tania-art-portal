import { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import CreateCommissionOption from '../../Components/CreateCommissionOption/CreateCommissionOptions';
import CommissionItem from '../../Components/CommissionItem';
import axios from 'axios';
import './EditCommissionOptions.css';

export default function EditCommissionOptions() {
  const [arrBaseTypes, setBaseTypes] = useState([]);
  const [arrBGTypes, setBGTypes] = useState([]);
  const [bAddingBase, setAddingBase] = useState(false);
  const [bAddingBG, setAddingBG] = useState(false);

  useEffect(() => {
    axios({
      url: '/api/commission-options?type=base',
      method: 'GET',
    })
      .then(({data}) => {
        setBaseTypes(data)
      })
      .catch(console.dir);

    axios({
      url: '/api/commission-options?type=bg',
      method: 'GET',
    })
      .then(({data}) => {
        setBGTypes(data)
      })
      .catch(console.dir);
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
          onClick={() => setAddingBG(true)}
        >
          Add New Background Option
        </button>
      </div>
      <div className='container-tables'>
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
              {arrBaseTypes.map(objBaseType =>
                <Fragment key={objBaseType.display}>
                  <CommissionItem
                    item={objBaseType}
                    callbackUpdate={objNewOption => {
                      axios({
                        url: `/api/commission-options/${objBaseType.display}?type=base`,
                        method: 'PUT',
                        data: {
                          Display: objNewOption.display,
                          Price: objNewOption.price,
                          Offer: objNewOption.offer || null,
                        },
                      }).catch(console.dir);

                      setBaseTypes(prev => prev.map(
                        objExistingType => objExistingType.display === objBaseType.display
                          ? objNewOption
                          : objExistingType,
                      ));
                    }}
                    callbackDelete={strDisplay => {
                      axios({
                        url: `/api/commission-options/${strDisplay}?type=base`,
                        method: 'DELETE',
                      }).catch(console.dir);

                      setBaseTypes(prev => prev.filter(o => o.display !== strDisplay));
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
              {arrBGTypes.map(objBGType =>
                <Fragment key={objBGType.display}>
                  <CommissionItem
                    item={objBGType}
                    callbackUpdate={objNewOption => {
                      axios({
                        url: `/api/commission-options/${objBGType.display}?type=bg`,
                        method: 'PUT',
                        data: {
                          Display: objNewOption.display,
                          Price: objNewOption.price,
                          Offer: objNewOption.offer || null,
                        },
                      }).catch(console.dir);

                      setBGTypes(prev => prev.map(
                        objExistingType => objExistingType.display === objBGType.display
                          ? objNewOption
                          : objExistingType,
                      ));
                    }}
                    callbackDelete={strDisplay => {
                      axios({
                        url: `/api/commission-options/${strDisplay}?type=bg`,
                        method: 'DELETE',
                      }).catch(console.dir);

                      setBGTypes(prev => prev.filter(o => o.display !== strDisplay));
                    }}
                  />
                </Fragment>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {bAddingBase &&
        <CreateCommissionOption
          callbackClose={() => setAddingBase(false)}
          strType='base'
          callbackAddOption={objNewOption => {
            setBaseTypes(prev => [...prev, objNewOption]);
            setAddingBase(false);
          }}
        />
      }
      {bAddingBG &&
        <CreateCommissionOption
          callbackClose={() => setAddingBG(false)}
          strType='bg'
          callbackAddOption={objNewOption => {
            setBGTypes(prev => [...prev, objNewOption]);
            setAddingBG(false);
          }}
        />
      }
    </div>
  );
};
