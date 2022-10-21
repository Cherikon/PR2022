import React from 'react';
import {Singleton, SingletonClass} from "./Singleton";

export const MainApp = () => {
    const classOne = new SingletonClass("One");
    const classTwo = new SingletonClass("Two");
    const classThree = new SingletonClass();
    const funcOne = new Singleton("One");
    const funcTwo = new Singleton("Two");
    const funcThree = new Singleton();
    console.log(`classOne - "${classOne.getName()}"`);
    console.log(`classTwo - "${classTwo.getName()}"`);
    console.log(`classThree - "${classThree.getName()}"`);
    console.log(`funcOne - "${funcOne.name}"`);
    console.log(`funcTwo - "${funcTwo.name}"`);
    console.log(`funcThree - "${funcThree.name}"`);
    return (
        <div>
            Главная страничка приложения
        </div>
    );
};

