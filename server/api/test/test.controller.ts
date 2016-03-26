import Test from './test.model'


function respondWithResult(res, statusCode = 200) {
  console.log("respondWidhResult:", statusCode);
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleError(res, statusCode = 500) {
  console.log("handleError", statusCode);
  return err => {
    res.status(statusCode).send(err);
  };
}

export function create(req, res) {
  console.log("create", req.body);
  Test.create(req.body, (err, thing) => {
    err ? handleError(res) : respondWithResult(thing, 201)
  });


  // return Test.create(req.body)
  //   .then(respondWithResult(res, 201))
  //   .catch(handleError(res));

}
