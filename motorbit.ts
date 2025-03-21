//% color="#EE6A50" weight=10 icon="\uf0d1"
namespace motorbit {
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06

    const STP_CHA_L = 2047
    const STP_CHA_H = 4095

    const STP_CHB_L = 1
    const STP_CHB_H = 2047

    const STP_CHC_L = 1023
    const STP_CHC_H = 3071

    const STP_CHD_L = 3071
    const STP_CHD_H = 1023

    let initialized = false

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADDRESS, MODE1, 0x00)
        setFreq(50);
        for (let idx = 0; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        initialized = true
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;
        //serial.writeValue("ch", channel)
        //serial.writeValue("on", on)
        //serial.writeValue("off", off)

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }

    function setStepper(index: number, dir: boolean): void {
        if (index == 1) {
            if (dir) {
                setPwm(0, STP_CHA_L, STP_CHA_H);
                setPwm(2, STP_CHB_L, STP_CHB_H);
                setPwm(1, STP_CHC_L, STP_CHC_H);
                setPwm(3, STP_CHD_L, STP_CHD_H);
            } else {
                setPwm(3, STP_CHA_L, STP_CHA_H);
                setPwm(1, STP_CHB_L, STP_CHB_H);
                setPwm(2, STP_CHC_L, STP_CHC_H);
                setPwm(0, STP_CHD_L, STP_CHD_H);
            }
        } else {
            if (dir) {
                setPwm(4, STP_CHA_L, STP_CHA_H);
                setPwm(6, STP_CHB_L, STP_CHB_H);
                setPwm(5, STP_CHC_L, STP_CHC_H);
                setPwm(7, STP_CHD_L, STP_CHD_H);
            } else {
                setPwm(7, STP_CHA_L, STP_CHA_H);
                setPwm(5, STP_CHB_L, STP_CHB_H);
                setPwm(6, STP_CHC_L, STP_CHC_H);
                setPwm(4, STP_CHD_L, STP_CHD_H);
            }
        }
    }

    function stopMotor(index: number) {
        setPwm((index - 1) * 2, 0, 0);
        setPwm((index - 1) * 2 + 1, 0, 0);
    }

    /*
     ============================
     ========== PUBLIC ==========
     ============================
     */

    export enum Servos {
        S1 = 0x01,
        S2 = 0x02,
        S3 = 0x03,
        S4 = 0x04,
        S5 = 0x05,
        S6 = 0x06,
        S7 = 0x07,
        S8 = 0x08
    }

    export enum Motors {
        M1 = 0x1,
        M2 = 0x2,
        M3 = 0x3,
        M4 = 0x4
    }

    export enum Steppers {
        STPM1_2 = 0x2,
        STPM3_4 = 0x1
    }

    export enum Turns {
        //% blockId="T1B4" block="1/4"
        T1B4 = 90,
        //% blockId="T1B2" block="1/2"
        T1B2 = 180,
        //% blockId="T1B0" block="1"
        T1B0 = 360,
        //% blockId="T2B0" block="2"
        T2B0 = 720,
        //% blockId="T3B0" block="3"
        T3B0 = 1080,
        //% blockId="T4B0" block="4"
        T4B0 = 1440,
        //% blockId="T5B0" block="5"
        T5B0 = 1800
    }
    
    //% blockId="get_servo" block="servo %servo"
    //% servo.fieldOptions.tooltips="false" pin.fieldOptions.width="250"
    export function getServo(servo: Servos) {
        return servo;
    }

    //% blockId="get_motor" block="motor %motor"
    //% motor.fieldOptions.tooltips="false" pin.fieldOptions.width="250"
    export function getMotor(motor: Motors) {
        return motor;
    }

    //% blockId="get_stepper" block="stepper %stepper"
    //% stepper.fieldOptions.tooltips="false" pin.fieldOptions.width="250"
    export function getStepper(stepper: Steppers) {
        return stepper;
    }

    //% blockId="get_turn" block="turn %turn"
    //% turn.fieldOptions.tooltips="false" pin.fieldOptions.width="250"
    export function getTurn(turn: Turns) {
        return turn;
    }

    /**
     * Servo Execute
     * @param index number Servo Channel; eg: S1
     * @param degree number [0-180] degree of servo; eg: 0, 90, 180
     */
    //% blockId=motorbit_servo block="Servo|%index|degree|%degree"
    //% group="Servo" weight=100
    //% degree.defl=90
    //% degree.min=0 degree.max=180
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% index.shadow=get_servo
    export function Servo(index: number, degree: number): void {
        if (!initialized) {
            initPCA9685()
        }
        // 50hz: 20,000 us
        let v_us = (degree * 1800 / 180 + 600) // 0.6 ~ 2.4
        let value = v_us * 4096 / 20000
        setPwm(index + 7, 0, value)
    }

    /**
     * Servo Execute
     * @param index Servo Channel; eg: S1
     * @param degree1 number [0-180] degree of servo; eg: 0, 90, 180
     * @param degree2 number [0-180] degree of servo; eg: 0, 90, 180
     * @param speed number [1-10] speed of servo; eg: 1, 10
     */
    //% blockId=motorbit_servospeed block="Servo|%index|degree start %degree1|end %degree2|speed %speed"
    //% group="Servo" weight=96
    //% degree1.min=0 degree1.max=180
    //% degree2.min=0 degree2.max=180
    //% speed.min=1 speed.max=10
    //% inlineInputMode=inline
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% index.shadow=get_servo
    export function Servospeed(index: number, degree1: number, degree2: number, speed: number): void {
        if (!initialized) {
            initPCA9685()
        }
        // 50hz: 20,000 us
        if (degree1 > degree2) {
            for (let i = degree1; i > degree2; i--) {
                let v_us = (i * 1800 / 180 + 600) // 0.6 ~ 2.4
                let value = v_us * 4096 / 20000
                basic.pause(4 * (10 - speed));
                setPwm(index + 7, 0, value)
            }
        } else {
            for (let i = degree1; i < degree2; i++) {
                let v_us = (i * 1800 / 180 + 600) // 0.6 ~ 2.4
                let value = v_us * 4096 / 20000
                basic.pause(4 * (10 - speed));
                setPwm(index + 7, 0, value)
            }
        }
    }

    /**
     * Geek Servo
     * @param index number Servo Channel; eg: S1
     * @param degree number [-45-225] degree of servo; eg: -45, 90, 225
     */
    //% blockId=motorbit_gservo block="Geek Servo|%index|degree %degree=protractorPicker"
    //% group="GeekServo" weight=96
    //% blockGap=50
    //% degree.defl=90
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% index.shadow=get_servo
    export function EM_GeekServo(index: number, degree: number): void {
        if (!initialized) {
            initPCA9685()
        }
        // 50hz: 20,000 us
        let v_us = ((degree - 90) * 20 / 3 + 1500) // 0.6 ~ 2.4
        let value = v_us * 4096 / 20000
        setPwm(index + 7, 0, value)
    }

    /**
     * GeekServo2KG
     * @param index number Servo Channel; eg: S1
     * @param degree number [0-360] degree of servo; eg: 0, 180, 360
     */
    //% blockId=motorbit_gservo2kg block="GeekServo2KG|%index|degree %degree"
    //% group="GeekServo" weight=95
    //% blockGap=50
    //% degree.min=0 degree.max=360
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% index.shadow=get_servo
    export function EM_GeekServo2KG(index: number, degree: number): void {
        if (!initialized) {
            initPCA9685()
        }
        // 50hz: 20,000 us
        //let v_us = (degree * 2000 / 360 + 500)  0.5 ~ 2.5
        let v_us = (Math.floor((degree) * 2000 / 350) + 500) //fixed
        let value = v_us * 4096 / 20000
        setPwm(index + 7, 0, value)
    }

    /**
     * GeekServo5KG
     * @param index number Servo Channel; eg: S1
     * @param degree number [0-360] degree of servo; eg: 0, 180, 360
     */
    //% blockId=motorbit_gservo5kg block="GeekServo5KG|%index|degree %degree"
    //% group="GeekServo" weight=94
    //% degree.min=0 degree.max=360
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% index.shadow=get_servo
    export function EM_GeekServo5KG(index: number, degree: number): void {
        if (!initialized) {
            initPCA9685()
        }
        const minInput = 0;
        const maxInput = 355;//理论值为360
        const minOutput = 500;
        const maxOutput = 2500;
        const v_us = ((degree - minInput) / (maxInput - minInput)) * (maxOutput - minOutput) + minOutput;

        let value = v_us * 4096 / 20000
        setPwm(index + 7, 0, value)
    }

    //% blockId=motorbit_gservo5kg_motor block="GeekServo5KG_MotorEN|%index|speed %speed"
    //% group="GeekServo" weight=93
    //% speed.min=-255 speed.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% index.shadow=get_servo
    export function EM_GeekServo5KG_Motor(index: number, speed: number): void { //5KG的电机模式 3000-5000 4000是回中
        if (!initialized) {
            initPCA9685()
        }
        const minInput = -255;
        const maxInput = 255;
        const minOutput = 5000;
        const maxOutput = 3000;

        const v_us = ((speed - minInput) / (maxInput - minInput)) * (maxOutput - minOutput) + minOutput;
        let value = v_us * 4096 / 20000
        setPwm(index + 7, 0, value)
    }

    //% blockId=motorbit_stepper_degree block="Stepper 28BYJ-48|%index|degree %degree"
    //% group="Stepper Motor" weight=91
    //% index.shadow=get_stepper
    export function StepperDegree(index: number, degree: number): void {
        if (!initialized) {
            initPCA9685()
        }
        setStepper(index, degree > 0);
        degree = Math.abs(degree);
        basic.pause(10240 * degree / 360);
        MotorStopAll()
    }

    //% blockId=motorbit_stepper_turn block="Stepper 28BYJ-48|%index|turn %turn"
    //% group="Stepper Motor" weight=90
    //% index.shadow=get_stepper
    //% turn.shadow=get_turn
    export function StepperTurn(index: number, turn: number): void {
        let degree = turn;
        StepperDegree(index, degree);
    }

    //% blockId=motorbit_stepper_dual block="Dual Stepper(Degree) |STPM1_2 %degree1| STPM3_4 %degree2"
    //% group="Stepper Motor" weight=89
    export function StepperDual(degree1: number, degree2: number): void {
        if (!initialized) {
            initPCA9685()
        }
        setStepper(1, degree1 > 0);
        setStepper(2, degree2 > 0);
        degree1 = Math.abs(degree1);
        degree2 = Math.abs(degree2);
        basic.pause(10240 * Math.min(degree1, degree2) / 360);
        if (degree1 > degree2) {
            stopMotor(3);
            stopMotor(4);
            basic.pause(10240 * (degree1 - degree2) / 360);
        } else {
            stopMotor(1);
            stopMotor(2);
            basic.pause(10240 * (degree2 - degree1) / 360);
        }

        MotorStopAll()
    }

    /**
     * Stepper Car move forward
     * @param distance number Distance to move in cm; eg: 10, 20
     * @param diameter number diameter of wheel in mm; eg: 48
     */
    //% blockId=motorbit_stpcar_move block="Car Forward|Distance(cm) %distance|Wheel Diameter(mm) %diameter"
    //% group="Stepper Motor" weight=88
    export function StpCarMove(distance: number, diameter: number): void {
        if (!initialized) {
            initPCA9685()
        }
        let delay = 10240 * 10 * distance / 3 / diameter; // use 3 instead of pi
        setStepper(1, delay > 0);
        setStepper(2, delay > 0);
        delay = Math.abs(delay);
        basic.pause(delay);
        MotorStopAll()
    }

    /**
     * Stepper Car turn by degree
     * @param turn number Degree to turn; eg: 90, 180, 360
     * @param diameter number diameter of wheel in mm; eg: 48
     * @param track number track width of car; eg: 125
     */
    //% blockId=motorbit_stpcar_turn block="Car Turn|Degree %turn|Wheel Diameter(mm) %diameter|Track(mm) %track"
    //% weight=87
    //% group="Stepper Motor" blockGap=50
    export function StpCarTurn(turn: number, diameter: number, track: number): void {
        if (!initialized) {
            initPCA9685()
        }
        let delay = 10240 * turn * track / 360 / diameter;
        setStepper(1, delay < 0);
        setStepper(2, delay > 0);
        delay = Math.abs(delay);
        basic.pause(delay);
        MotorStopAll()
    }

    //% blockId=motorbit_stop_all block="Motor Stop All"
    //% group="Motor" weight=81
    //% blockGap=50
    export function MotorStopAll(): void {
        if (!initialized) {
            initPCA9685()
        }
        for (let idx = 1; idx <= 4; idx++) {
            stopMotor(idx);
        }
    }

    //% blockId=motorbit_stop block="Motor Stop|%index|"
    //% group="Motor" weight=82
    //% index.shadow=get_motor
    export function MotorStop(index: number): void {
        MotorRun(index, 0);
    }

    //% blockId=motorbit_motor_run block="Motor|%index|speed %speed"
    //% group="Motor" weight=86
    //% speed.min=-255 speed.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% index.shadow=get_motor
    export function MotorRun(index: number, speed: number): void {
        if (!initialized) {
            initPCA9685()
        }
        speed = speed * 16; // map 255 to 4096
        if (speed >= 4096) {
            speed = 4095
        }
        if (speed <= -4096) {
            speed = -4095
        }
        if (index > 4 || index <= 0)
            return
        let pp = (index - 1) * 2
        let pn = (index - 1) * 2 + 1
        if (speed >= 0) {
            setPwm(pp, 0, speed)
            setPwm(pn, 0, 0)
        } else {
            setPwm(pp, 0, 0)
            setPwm(pn, 0, -speed)
        }
    }

    /**
     * Execute single motors with delay
     * @param index number Motor Index; eg: A01A02, B01B02, A03A04, B03B04
     * @param speed number [-255-255] speed of motor; eg: 150, -150
     * @param delay number second delay to stop; eg: 1
     */
    //% blockId=motorbit_motor_rundelay block="Motor|%index|speed %speed|delay %delay|s"
    //% group="Motor" weight=85
    //% speed.min=-255 speed.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% index.shadow=get_motor
    export function MotorRunDelay(index: number, speed: number, delay: number): void {
        MotorRun(index, speed);
        basic.pause(delay * 1000);
        MotorRun(index, 0);
    }

    /**
     * Execute two motors at the same time
     * @param motor1 number First Motor; eg: A01A02, B01B02
     * @param speed1 number [-255-255] speed of motor; eg: 150, -150
     * @param motor2 number Second Motor; eg: A03A04, B03B04
     * @param speed2 number [-255-255] speed of motor; eg: 150, -150
     */
    //% blockId=motorbit_motor_dual block="Motor|%motor1|speed %speed1|%motor2|speed %speed2"
    //% group="Motor" weight=84
    //% inlineInputMode=inline
    //% speed1.min=-255 speed1.max=255
    //% speed2.min=-255 speed2.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    //% motor1.shadow=get_motor
    //% motor2.shadow=get_motor
    export function MotorRunDual(motor1: number, speed1: number, motor2: number, speed2: number): void {
        MotorRun(motor1, speed1);
        MotorRun(motor2, speed2);
    }

    /**
     * Execute two motors at the same time
     * @param motor1 number First Motor; eg: A01A02, B01B02
     * @param speed1 number [-255-255] speed of motor; eg: 150, -150
     * @param motor2 number Second Motor; eg: A03A04, B03B04
     * @param speed2 number [-255-255] speed of motor; eg: 150, -150
     */
    //% blockId=motorbit_motor_dualDelay block="Motor|%motor1|speed %speed1|%motor2|speed %speed2|delay %delay|s "
    //% group="Motor" weight=83
    //% inlineInputMode=inline
    //% speed1.min=-255 speed1.max=255
    //% speed2.min=-255 speed2.max=255
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=5
    //% motor1.shadow=get_motor
    //% motor2.shadow=get_motor
    export function MotorRunDualDelay(motor1: number, speed1: number, motor2: number, speed2: number, delay: number): void {
        MotorRun(motor1, speed1);
        MotorRun(motor2, speed2);
        basic.pause(delay * 1000);
        MotorRun(motor1, 0);
        MotorRun(motor2, 0);
    }
}
