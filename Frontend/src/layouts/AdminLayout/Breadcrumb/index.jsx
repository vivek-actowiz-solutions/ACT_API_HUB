// import React, { useState, useEffect } from 'react';
// // import { ListGroup } from 'react-bootstrap';
// import { Link, useLocation } from 'react-router-dom';

// import navigation from '../../../menu-items';
// import { BASE_TITLE } from '../../../config/constant';

// const Breadcrumb = () => {
//   const location = useLocation();
//   const [breadcrumbs, setBreadcrumbs] = useState([]);

//   useEffect(() => {
//     const path = location.pathname;
//     const matchedItems = [];

//     const findBreadcrumbs = (items, parents = []) => {
//       for (const item of items) {
//         if (item.type === 'item') {
//           // Support dynamic route like /api-detail/:id
//           const itemPath = item.url?.replace(/:\w+/g, '[^/]+');
//           const regex = new RegExp(`^${itemPath}$`);

//           if (regex.test(path)) {
//             matchedItems.push(...parents, item);
//             return true;
//           }
//         }

//         if (item.children) {
//           const found = findBreadcrumbs(item.children, [...parents, item]);
//           if (found) return true;
//         }
//       }
//       return false;
//     };

//     findBreadcrumbs(navigation.items);
//     setBreadcrumbs(matchedItems);

//     if (matchedItems.length > 0) {
//       document.title = matchedItems[matchedItems.length - 1].title + BASE_TITLE;
//     }
//   }, [location.pathname]);

//   return (
//     <div className="page-header mb-3">
//       <div className="page-block">
//         <div className="row align-items-center">
//           <div className="col-md-12">
//             <h5 className="mb-2 fw-bold">{breadcrumbs[breadcrumbs.length - 1]?.title || ''}</h5>

//             <div className="d-flex align-items-center text-muted">
//               <Link to="/" className="text-muted me-2">
//                 <i className="feather icon-home" />
//               </Link>
//               <span className="mx-1">/</span>
//               <span className="fw-semibold text-dark">{breadcrumbs[breadcrumbs.length - 1]?.title || ''}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Breadcrumb;
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import navigation from '../../../menu-items';
import { BASE_TITLE } from '../../../config/constant';
// import { useNavigate } from 'react-router-dom';

const Breadcrumb = () => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  // const navigate = useNavigate();
  useEffect(() => {
    const path = location.pathname;
    const matchedItems = [];

    const findBreadcrumbs = (items, parents = []) => {
      for (const item of items) {
        if (item.type === 'item') {
          const itemPath = item.url?.replace(/:\w+/g, '[^/]+');
          const regex = new RegExp(`^${itemPath}$`);
          if (regex.test(path)) {
            matchedItems.push(...parents, item);
            return true;
          }
        }
        if (item.children) {
          const found = findBreadcrumbs(item.children, [...parents, item]);
          if (found) return true;
        }
      }
      return false;
    };

    findBreadcrumbs(navigation.items);
    setBreadcrumbs(matchedItems);

    if (matchedItems.length > 0) {
      document.title = matchedItems[matchedItems.length - 1].title + BASE_TITLE;
    }
  }, [location.pathname]);

  return (
    <div className="page-header mb-3">
      <div className="page-block">
        <div className="row align-items-center">
          <div className="col-md-12">
            <h5 className="mb-2 fw-bold">{breadcrumbs[breadcrumbs.length - 1]?.title || ''}</h5>

            <div className="d-flex align-items-center text-muted flex-wrap">
              <Link to="/" className="text-muted me-2">
                <i className="feather icon-home" />
              </Link>
              <span className="mx-1"></span>

              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index !== breadcrumbs.length - 1 ? (
                    <>
                      {crumb.url ? (
                        <Link to={crumb.url} className="text-muted me-2 text-decoration-none">
                          {crumb.title}
                        </Link>
                      ) : (
                        <span className="text-muted me-2">{crumb.title}</span>
                      )}
                      <span className="mx-1">/</span>
                    </>
                  ) : (
                    <span className="fw-semibold text-dark">{crumb.title}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
