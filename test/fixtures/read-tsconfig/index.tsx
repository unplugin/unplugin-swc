function sealed(constructor: Function) {}

@sealed
export class BugReport {}

export const App = () => <div>hi</div>
