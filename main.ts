/**
 * This file contain test code for extension development.
 * It will not be included or compiled when this package is added to a project as an extension
 */


input.onButtonPressed(Button.A, function () {
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S1), 180)
    motorbit.MotorRun(motorbit.getMotor(motorbit.Motors.M1), 255)
})
input.onButtonPressed(Button.B, function () {
    // stop all motors
    motorbit.Servo(motorbit.getServo(motorbit.Servos.S1), 90)
    motorbit.MotorStopAll()
})
