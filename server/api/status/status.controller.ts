import Status, {StatusInterface} from './status.model';


export function sendStatus(req: StatusInterface, res: Function = () => {}) {
  Status.create(req, (err, dbStatus) => {
    err ? res(false) : res(dbStatus);
  })
}
