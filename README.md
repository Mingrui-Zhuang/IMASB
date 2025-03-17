# IMASB: Influence of Music Affecting Swing of Body
 
Dataset: [Body Sway When Standing and Listening to Music Modified to Reinforce Virtual Reality Environment Motion (From Physionet)](https://physionet.org/content/body-sway-music-vr/1.0.0/).

Our goal is to explore how people listening to various kinds of music vary in terms of frequency changes as well as the condition of eyes opening that would affect their body movement. The dataset contains subjects' reactions such as the center of pressure and moments (torques) about the medial-lateral and anterior-posterior axes measured in the music intervals of 60 seconds. Our final web page will be composed of two separate interactive visualizations, each with a time slider to plot how x values are changed by time. The first plot would focus on movement in the x and y directions. The second one, through aggregation on the moment the subject has at each millisecond, focuses on comparing their proactive reaction under different conditions. 


# Initial Prototype
## 1. What have you done so far?
We have tried to understand the provided dataset structure deeper, such as how subject-wise body movement in displacement and center of pressure location changed with respect to different versions of music (no music, unmodified, 0.1Hz shift and 0.25Hz shift). Currently, on our webpage, we have selected a subject for some initial trial experiment, and visualized four trajectory plots, for their movement under different music types. A title and a time slider were included at the top of the plots. For the overall webpage design, we have two plans proposed. One idea is to make the webpage vertically long and scrollable, such that we display each plot separately with some description around it, guiding the viewer step-by-step on how gradually adjusting the music frequency affects the movement of their body. A bar plot, subsequentially, would be attached next to each main plot to show the current cumulated average displacement among subjects, and also animated along with the time slider. However, there is a tradeoff, as combing these plots together at the same window view could effectively make the comparison more straightforward; thus, if we could find a representative subject such that there is a clear distinction between the increase of Hz for music intensity and body movement reaction, we could choose the second design.

## 2. What will be the most challenging of your project to design and why?
Data preparation：Cleaning and imputing the missing data, as well as aggregating the data to obtain an accumulation of data which generalizes subjects concerned without getting trouble into decimal computation issues. 

Visualization design: Picking an efficient layout to display data without too much information involved to distract the reader. At the same time, it should be well organized to have a nice scroll-style storytelling presentation.

Visualization implementation: Optimizing a concurrent plotting algorithm for four time-series trajectory plots to avoid any lag when scrolling the slider to observe subjects’ change over time.
