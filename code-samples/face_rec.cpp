#include "grovepi.h"
#include <pthread.h>
#include <sys/wait.h>
#include <sys/types.h>
#include <unistd.h>

using namespace GrovePi;
//pthread_t tid[2];

/*
void* HDMI(void *arg)
{
    unsigned long i = 0;
    //pthread_t id = pthread_self();

    system("gst-launch-1.0 -e camerasrc camera-crop-width=1920 camera-crop-height=1080 ! nxvideosink &");

    return NULL;
}
*/

int main()
{
    int button_pin = 4;
    int buzzer_pin = 8;
    int redled_pin = 3;
    int greenled_pin = 7;
    int button_state; // variable to hold the current state of the button
    int i = 0;
    int err;
    pid_t parent_pid, child_pid;
    int status;
//    err = pthread_create(&(tid[i]), NULL, &HDMI, NULL);
    
    FILE * fp;
    char * line = NULL;
    size_t len = 0;
    ssize_t read; 
/*
    if (err != 0)
       printf("\ncan't create HDMI thread :[%s]", strerror(err));
    else
       printf("\n HDMI thread created successfully\n");
 */    
    try
    {
                initGrovePi(); 
                pinMode(button_pin, INPUT); 
                pinMode(buzzer_pin, OUTPUT);
                pinMode(greenled_pin, OUTPUT);
                pinMode(redled_pin, OUTPUT); 
                printf("Waiting for button press\n");

                while(true)
                {
                   button_state = digitalRead(button_pin);
                   if(button_state == 1)
                   {
        		child_pid = fork();
			if(child_pid == 0)
                        { 
                             system("fswebcam -d /dev/video6 -r 640x480 -p YUV420P --no-banner -S 5 image_vga.jpg");
 
                             system("python ./validate.py");

                             fp = fopen("./Detection.txt", "r");
                             if (fp == NULL)
                                 exit(EXIT_FAILURE);
                             while ((read = getline(&line, &len, fp)) != -1) {
                                 if (strcmp(line,"success\n")==0)
                                 {  
                                    printf("Welcome home!");
                                    for(int i=0;i<12;i++)
                                    {
                                      digitalWrite(greenled_pin, HIGH);
                                      delay(500);
                                      digitalWrite(greenled_pin, LOW);
                                      delay(150);
                                    }                 
                                    for(int i=0;i<2;i++)
                                    {
                                       digitalWrite(buzzer_pin, HIGH);
                                       delay(300);
                                       digitalWrite(buzzer_pin, LOW);
                                       delay(100);
                                     }
                                 }                                 
                                 if (strcmp(line,"fail\n") ==0 || strcmp( line,"failure\n")==0)
                                 { 
                                     printf("Not belong to the family! Alarm!");
                              
                                     for(int i=0;i<12;i++)
                                     {
                                       digitalWrite(redled_pin, HIGH);
                                       delay(500);
                                       digitalWrite(redled_pin, LOW);
                                       delay(400);
                                     } 
                                     for(int i=0;i<3;i++)
                                     {
                                        digitalWrite(buzzer_pin, HIGH);
                                        delay(1000);
                                        digitalWrite(buzzer_pin, LOW);
                                        delay(300);
                                     } 
                                  } 


                                 if (strcmp(line,"no face detected\n")==0)
                                 { 
                                      printf("Face to the camera and try again!");
                                      for(int i=0;i<18;i++)
                                      {
                                        digitalWrite(redled_pin, HIGH);
                                        delay(300);
                                        digitalWrite(redled_pin, LOW);
                                        delay(200);
                                      } 
                                      for(int i=0;i<5;i++)
                                      {
                                        digitalWrite(buzzer_pin, HIGH);
                                        delay(200);
                                        digitalWrite(buzzer_pin, LOW);
                                        delay(100);
                                      } 

                                  }
                             }
                             fclose(fp);
                             if (line)
                                free(line);
                             exit(1);

                     }
                        else if (child_pid < 0) {
			     printf("fork error");
			     exit(1);
			} else {
                             wait(&status); 

                         }
                        delay(100);
                    } /* end of button */
                 }   /* end of while */ 
      }  /* end of try */

      catch (I2CError &error)
      {
                printf(error.detail());

                return -1;
      } 

        return 0;
}

