class AbstractSingle {
    constructor(name) {
        if (this.constructor.name === 'AbstractSingle') {
            throw new Error(`${this.constructor.name}: can not create instance of abstract class`);
        }

        this.name = name;
    }
}

export class SingletonClass extends AbstractSingle {
    constructor(name = "") {
        super(name);
        if (!!SingletonClass.instance) {
            return SingletonClass.instance;
        }

        SingletonClass.instance = this;

        return this;
    }

    getName() {
        return this.name;
    }
}

export function Singleton(name = '') {
    if (!Singleton._instance) {
        Singleton._instance = this;
    }
    this.name = name
    return Singleton._instance;
}