/*
  Q Light Controller Plus
  efxfixture.h

  Copyright (c) Heikki Junnila
                Massimo Callegari

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0.txt

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

#ifndef EFXFIXTURE_H
#define EFXFIXTURE_H

#include <QImage>
#include "function.h"
#include "grouphead.h"

class MasterTimer;
class FadeChannel;
class EFXFixture;
class Scene;
class EFX;
class Doc;
class QImage;

/** @addtogroup engine_functions Functions
 * @{
 */

#define KXMLQLCEFXFixture               QStringLiteral("Fixture")
#define KXMLQLCEFXFixtureID             QStringLiteral("ID")
#define KXMLQLCEFXFixtureHead           QStringLiteral("Head")
#define KXMLQLCEFXFixtureMode           QStringLiteral("Mode")
#define KXMLQLCEFXFixtureDirection      QStringLiteral("Direction")
#define KXMLQLCEFXFixtureStartOffset    QStringLiteral("StartOffset")
#define KXMLQLCEFXFixtureIntensity      QStringLiteral("Intensity")

#define KXMLQLCEFXFixtureCustXM         QStringLiteral("CustomXMSB")
#define KXMLQLCEFXFixtureCustXL         QStringLiteral("CustomXLSB")
#define KXMLQLCEFXFixtureCustYM         QStringLiteral("CustomYMSB")
#define KXMLQLCEFXFixtureCustYL         QStringLiteral("CustomYLSB")

#define KXMLQLCEFXFixtureModePanTilt        QStringLiteral("Position")
#define KXMLQLCEFXFixtureModeDimmer         QStringLiteral("Dimmer")
#define KXMLQLCEFXFixtureModeRGB            QStringLiteral("RGB")
#define KXMLQLCEFXFixtureModeCustom         QStringLiteral("Custom")

class EFXFixture final
{
    friend class EFX;

public:
    enum Mode
    {
        PanTilt,
        Dimmer,
        RGB,
        Custom
    };

    /*************************************************************************
     * Initialization
     *************************************************************************/
public:
    /** Constructor */
    EFXFixture(const EFX* parent);

    /** Destructor */
    ~EFXFixture();

    /** Copy contents from another EFXFixture */
    void copyFrom(const EFXFixture* ef);

private:
    /** The EFX function that this fixture belongs to. */
    const EFX* const m_parent;

    /*************************************************************************
     * Public properties
     *************************************************************************/
public:
    /** Set the Fixture Head that this EFXFixture represents. */
    void setHead(GroupHead const & head);

    /** Get the Fixture Head that this EFXFixture represents. */
    GroupHead const & head() const;

    /** Set this fixture's initial direction. */
    void setDirection(Function::Direction dir);

    /** Get this fixture's initial direction. */
    Function::Direction direction() const;

    /** Set this fixture's start offset */
    void setStartOffset(int startOffset);

    /** Get this fixture's start offset */
    int startOffset() const;

    /** Set the parameter(s) that this efx will animate (ie. dimmer, RGB, ...) */
    void setMode(Mode mode);

    /** Get the parameter(s) that this efx will animate (ie. dimmer, RGB, ...) */
    Mode mode() const;

    /** Return the Universe ID where this head falls in */
    quint32 universe() const;

    /**
     * Check that this object has a fixture ID and at least LSB channel
     * for pan and/or tilt.
     */
    bool isValid() const;

    void durationChanged();
	
	void setCustXMSB(quint32 value);
	void setCustXLSB(quint32 value);
	
	void setCustYMSB(quint32 value);
	void setCustYLSB(quint32 value);

public:
    /** Get the supported mode for this fixture in a string list */
    QStringList modeList() const;
	
	/** Channels count */
	int channels();
	
	/** List of channel names for this fixture in a string list */
	QStringList channelList() const;
	
	/** Channel ID to string name and vice versa */
	QString channelToString(quint32 channel);
	quint32 stringtoChannel(QString channel);
	
	/** Get the QLCChannel from this EFX Fixture */
	const QLCChannel* getChannel(quint32 channel) const;
	
    /** Convert a mode to a string */
    static QString modeToString(Mode algo);

    /** Convert a string to an mode type */
    static Mode stringToMode(const QString& str);
	
	quint32 firstMSBChannel();
	quint32 firstLSBChannel();
	
	quint32 secondMSBChannel();
	quint32 secondLSBChannel();
	
	quint32 custXMSB();
	quint32 custXLSB();
	
	quint32 custYMSB();
	quint32 custYLSB();

private:
    GroupHead m_head;
    quint32 m_universe;
    Function::Direction m_direction;
    int m_startOffset;
    Mode m_mode;
	
	void getEFXChannels();

    /*************************************************************************
     * Load & Save
     *************************************************************************/
public:
    bool loadXML(QXmlStreamReader &root);
    bool saveXML(QXmlStreamWriter *doc) const;

    /*************************************************************************
     * Run-time properties
     *************************************************************************/
private:
    /** Get the master engine instance */
    const Doc* doc() const;

    /** Set the order number in serial propagation mode */
    void setSerialNumber(int number);

    /** Get the order number in serial propagation mode */
    int serialNumber() const;

    /** Reset the fixture when the EFX is stopped */
    void reset();

    /** Check, whether this EFXFixture is done (no more events).
        This can happen basically only if SingleShot mode is enabled. */
    bool isDone() const;

    /** Get this fixture's time offset (in serial and asymmetric modes) */
    uint timeOffset() const;

private:
    /** This fixture's order number in serial propagation mode */
    int m_serialNumber;

    /** This fixture's current run-time direction */
    Function::Direction m_runTimeDirection;

    /** When running in single shot mode, the fixture is marked done
        after it has completed a full cycle. */
    bool m_done;

    /** Indicates, whether start() has been called for this fixture */
    bool m_started;

    /** Elapsed milliseconds since last reset() */
    uint m_elapsed;

    /** 0..M_PI*2, current position, recomputed on each timer tick; depends on elapsed() and parent->duration() */
    float m_currentAngle;


    /*************************************************************************
     * Running
     *************************************************************************/
private:
    void start(QSharedPointer<GenericFader> fader);
    void stop();

    /** Calculate the next step data for this fixture */
    void nextStep(QList<Universe *> universes, QSharedPointer<GenericFader> fader);

    /** Set a 16bit value on a fader gotten from the engine */
    void updateFaderValues(FadeChannel &fc, quint32 value);

    /** Write this EFXFixture's channel data to universe faders */
    void setPointPanTilt(QList<Universe *> universes, QSharedPointer<GenericFader> fader, float pan, float tilt);
    void setPointDimmer(QList<Universe *> universes, QSharedPointer<GenericFader> fader, float dimmer);
    void setPointRGB (QList<Universe *> universes, QSharedPointer<GenericFader> fader, float x, float y);

    /** Write a dimmer value to the cached intensity channel (used when the EFX
        has dimmer control enabled, where m_firstMsbChannel/m_secondMsbChannel are
        already taken by pan/tilt) */
    void setPointIntensity(QList<Universe *> universes, QSharedPointer<GenericFader> fader, float dimmer);

private:
    quint32 m_firstMsbChannel;
    quint32 m_firstLsbChannel;
    quint32 m_secondMsbChannel;
    quint32 m_secondLsbChannel;
	
	quint32 m_custXMsbChannel;
    quint32 m_custXLsbChannel;
    quint32 m_custYMsbChannel;
    quint32 m_custYLsbChannel;

    /** Intensity channel cache used when the EFX has dimmer control enabled
        (pan/tilt use the channels above) */
    quint32 m_intensityMsbChannel;
    quint32 m_intensityLsbChannel;

private:
    static QImage m_rgbGradient;
};

/** @} */

#endif
