/**
 * This file contain test code for extension development.
 * It will not be included or compiled when this package is added to a project as an extension
 */


input.onButtonPressed(Button.A, function () {
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S1), 180)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S2), 180)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S3), 180)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S4), 180)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S5), 180)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S6), 180)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S7), 180)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S8), 180)
    motorbit.MotorRun(motorbit.getMotor(motorbit.Motors.M1), 255)
    motorbit.MotorRun(motorbit.getMotor(motorbit.Motors.M2), 255)
    motorbit.MotorRun(motorbit.getMotor(motorbit.Motors.M3), 255)
    motorbit.MotorRun(motorbit.getMotor(motorbit.Motors.M4), 255)
})
input.onButtonPressed(Button.B, function () {
    // stop all motors
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S1), 90)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S2), 90)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S3), 90)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S4), 90)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S5), 90)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S6), 90)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S7), 90)
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S8), 90)
    motorbit.MotorStopAll()
})

