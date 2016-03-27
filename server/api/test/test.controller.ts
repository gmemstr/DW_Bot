import Test from './test.model'



export function create(req, res: Function = () => {}) {
  console.log("create", req);
  Test.create(req, (err, thing) => {
    err ? res(err) : res(thing)
  });

}
